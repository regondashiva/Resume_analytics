from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from models.models import User
from database.connection import get_db
from authentication.jwt_handler import get_current_user
from analytics.service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/dashboard")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get dashboard overview statistics (All authenticated roles)"""
    stats = AnalyticsService.get_dashboard_stats(db)
    return stats


@router.get("/skills")
async def get_skills_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get skills frequency analytics"""
    data = AnalyticsService.get_skills_analytics(db)
    return {"data": data}


@router.get("/experience")
async def get_experience_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get candidate experience distribution analytics"""
    data = AnalyticsService.get_experience_analytics(db)
    return {"data": data}


@router.get("/trends")
async def get_recruitment_trends(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get recruitment application/selection trends"""
    data = AnalyticsService.get_recruitment_trends(db)
    return {"data": data}


@router.get("/funnel")
async def get_global_candidate_funnel(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get global candidate recruitment funnel stats"""
    data = AnalyticsService.get_global_candidate_funnel(db)
    return {"data": data}


@router.get("/funnel/{job_id}")
async def get_candidate_funnel(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get candidate funnel for a job"""
    data = AnalyticsService.get_candidate_funnel(db, job_id)
    return {"data": data}


@router.get("/scores")
async def get_match_scores_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get match scores ranges distribution (Admin/HR only)"""
    if current_user.role not in ["admin", "hr"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Only HR and Admins can view granular score distributions."
        )
    data = AnalyticsService.get_match_score_analytics(db)
    return {"data": data}


@router.get("/departments")
async def get_department_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get active job counts by department (Admin/HR only)"""
    if current_user.role not in ["admin", "hr"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Only HR and Admins can view department analytics."
        )
    data = AnalyticsService.get_department_analytics(db)
    return {"data": data}


@router.get("/pipeline")
async def get_pipeline_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get candidates recruitment stages distribution (Admin/HR only)"""
    if current_user.role not in ["admin", "hr"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Only HR and Admins can view pipeline stage analytics."
        )
    data = AnalyticsService.get_pipeline_analytics(db)
    return {"data": data}
