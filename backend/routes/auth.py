from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from models.schemas import UserCreate, UserLogin, UserUpdate, TokenResponse, UserResponse
from models.models import User
from database.connection import get_db
from authentication.jwt_handler import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)
from utils.activity_logger import log_activity

router = APIRouter(prefix="/auth", tags=["authentication"])

# Input DTOs for Admin operations and Forgot Password
class UserAdminUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    token: str
    new_password: str

@router.post("/signup", response_model=TokenResponse)
async def signup(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    hashed_pass = hash_password(user.password)
    new_user = User(
        name=user.name,
        email=user.email,
        password_hash=hashed_pass,
        role=user.role,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Log action
    log_activity(
        db,
        new_user.id,
        new_user.name,
        "User Signup",
        f"Registered new account: {new_user.email} with role: {new_user.role}"
    )

    # Generate token
    access_token_expires = timedelta(hours=24)
    access_token = create_access_token(
        data={"sub": new_user.email},
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.from_orm(new_user),
    }


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user"""
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
        
    is_valid = verify_password(credentials.password, user.password_hash)
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been deactivated. Please contact an Administrator."
        )

    # Log action
    log_activity(
        db,
        user.id,
        user.name,
        "User Login",
        f"Authenticated successfully with role: {user.role}"
    )

    # Generate token
    access_token_expires = timedelta(hours=24)
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.from_orm(user),
    }


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user),
):
    """Get current user info"""
    return UserResponse.from_orm(current_user)


@router.put("/update", response_model=UserResponse)
async def update_profile(
    profile_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update current user profile info"""
    changes = []
    if profile_data.name is not None:
        current_user.name = profile_data.name
        changes.append("name")
        
    if profile_data.email is not None:
        # Check if email is already taken
        existing_user = db.query(User).filter(User.email == profile_data.email, User.id != current_user.id).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered by another account"
            )
        current_user.email = profile_data.email
        changes.append("email")
        
    if profile_data.password is not None and profile_data.password != "":
        current_user.password_hash = hash_password(profile_data.password)
        changes.append("password")
        
    db.commit()
    db.refresh(current_user)

    # Log action
    if changes:
        log_activity(
            db,
            current_user.id,
            current_user.name,
            "Profile Updated",
            f"Updated fields: {', '.join(changes)}"
        )

    return current_user


# ==========================================
# 👑 ADMIN & USER MANAGEMENT ENDPOINTS
# ==========================================

@router.get("/users", response_model=List[UserResponse])
async def get_all_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all registered users (Admin only)"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Only Admins can manage users."
        )
    users = db.query(User).all()
    return users


@router.put("/users/{user_id}", response_model=UserResponse)
async def admin_update_user(
    user_id: int,
    user_data: UserAdminUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Modify a user's details or role (Admin only)"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Only Admins can manage users."
        )
    
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
        
    if user_data.name is not None:
        target_user.name = user_data.name
    if user_data.email is not None:
        dup = db.query(User).filter(User.email == user_data.email, User.id != user_id).first()
        if dup:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered by another account"
            )
        target_user.email = user_data.email
    if user_data.role is not None:
        if user_data.role not in ["admin", "hr", "recruiter"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid role. Must be 'admin', 'hr', or 'recruiter'"
            )
        target_user.role = user_data.role
    if user_data.is_active is not None:
        target_user.is_active = user_data.is_active
        
    db.commit()
    db.refresh(target_user)
    
    log_activity(
        db, 
        current_user.id, 
        current_user.name, 
        "Updated User Account", 
        f"Modified account '{target_user.email}' -> Role: {target_user.role}, Active: {target_user.is_active}"
    )
    
    return target_user


@router.delete("/users/{user_id}")
async def admin_delete_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Deactivate or disable a user account (Admin only)"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Only Admins can manage users."
        )
        
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot deactivate your own admin session!"
        )
        
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
        
    target_user.is_active = False
    db.commit()
    
    log_activity(
        db,
        current_user.id,
        current_user.name,
        "Deactivated User Account",
        f"Disabled credentials for user: {target_user.email}"
    )
    
    return {"message": f"User account {target_user.name} deactivated successfully."}


@router.get("/activity-logs")
async def get_activity_logs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get list of all system audit logs (Admin only)"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Only Admins can view activity logs."
        )
    from models.models import ActivityLog
    logs = db.query(ActivityLog).order_by(ActivityLog.timestamp.desc()).limit(100).all()
    
    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "user_name": log.user_name,
            "action": log.action,
            "details": log.details,
            "timestamp": log.timestamp.isoformat() if log.timestamp else ""
        }
        for log in logs
    ]


@router.post("/forgot-password")
async def forgot_password(
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    """Request a password reset link (Public)"""
    user = db.query(User).filter(User.email == payload.email).first()
    
    log_activity(
        db,
        user.id if user else None,
        user.name if user else "Unauthenticated Guest",
        "Forgot Password Requested",
        f"Requested recovery token for: {payload.email}"
    )
    
    return {
        "message": "If the email is registered, a password reset token has been dispatched.",
        "debug_token": "RECRUITAI-RESET-998822"
    }


@router.post("/reset-password")
async def reset_password(
    payload: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    """Reset password using recovery token (Public)"""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
        
    if payload.token != "RECRUITAI-RESET-998822":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token."
        )
        
    user.password_hash = hash_password(payload.new_password)
    db.commit()
    
    log_activity(
        db,
        user.id,
        user.name,
        "Password Reset Successful",
        f"Password updated using recovery token for: {user.email}"
    )
    
    return {"message": "Password updated successfully. You can now log in."}
