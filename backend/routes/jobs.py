from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from models.models import Job, User
from models.schemas import JobCreate, JobUpdate, JobResponse
from database.connection import get_db
from authentication.jwt_handler import get_current_user
from utils.activity_logger import log_activity

router = APIRouter(prefix="/job", tags=["jobs"])


@router.post("/create", response_model=JobResponse)
async def create_job(
    job: JobCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new job description (Admin only)"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Only Admins can manage job descriptions."
        )

    new_job = Job(
        title=job.title,
        description=job.description,
        required_skills=job.required_skills or [],
        experience_required=job.experience_required,
        qualifications=job.qualifications,
        department=job.department or "Engineering"
    )

    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    log_activity(
        db,
        current_user.id,
        current_user.name,
        "Created Job Description",
        f"Created new job listing: '{new_job.title}' for Department: '{new_job.department}'"
    )

    return JobResponse.from_orm(new_job)


@router.get("/all")
async def get_all_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all active jobs"""
    jobs = db.query(Job).filter(Job.is_active == True).all()
    return {
        "jobs": [JobResponse.from_orm(job) for job in jobs],
        "total": len(jobs),
    }


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get job details"""
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    return JobResponse.from_orm(job)


@router.put("/{job_id}", response_model=JobResponse)
async def update_job(
    job_id: int,
    job_update: JobUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update job description (Admin only)"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Only Admins can manage job descriptions."
        )

    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    update_data = job_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(job, field, value)

    db.commit()
    db.refresh(job)

    log_activity(
        db,
        current_user.id,
        current_user.name,
        "Updated Job Description",
        f"Modified details for job: '{job.title}' (ID: {job_id})"
    )

    return JobResponse.from_orm(job)


@router.delete("/{job_id}")
async def delete_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete/deactivate a job (Admin only)"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Only Admins can manage job descriptions."
        )

    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    job.is_active = False
    db.commit()

    log_activity(
        db,
        current_user.id,
        current_user.name,
        "Deactivated Job Description",
        f"Deactivated job listing: '{job.title}' (ID: {job_id})"
    )

    return {"message": "Job deleted successfully"}
