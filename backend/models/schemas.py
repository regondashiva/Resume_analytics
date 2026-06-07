from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = "hr"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Candidate Schemas
class CandidateBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    skills: Optional[List[str]] = None
    experience_years: float = 0
    education: Optional[str] = None
    experience_details: Optional[str] = None

class CandidateCreate(CandidateBase):
    pass

class CandidateUpdate(BaseModel):
    skills: Optional[List[str]] = None
    experience_years: Optional[float] = None
    education: Optional[str] = None
    score: Optional[float] = None

class CandidateResponse(CandidateBase):
    id: int
    resume_path: Optional[str]
    score: float
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Job Schemas
class JobBase(BaseModel):
    title: str
    description: str
    required_skills: Optional[List[str]] = None
    experience_required: float = 0
    qualifications: Optional[str] = None
    department: Optional[str] = "Engineering"

class JobCreate(JobBase):
    pass

class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    required_skills: Optional[List[str]] = None
    experience_required: Optional[float] = None
    qualifications: Optional[str] = None
    department: Optional[str] = None

class JobResponse(JobBase):
    id: int
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Matching Schemas
class MatchingResultResponse(BaseModel):
    id: int
    candidate_id: int
    job_id: int
    match_score: float
    matched_skills: List[str]
    missing_skills: List[str]
    experience_match: float
    recommendation: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Auth Schemas
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None

# Analytics Schemas
class DashboardStats(BaseModel):
    total_candidates: int
    total_jobs: int
    selected_candidates: int
    rejected_candidates: int
    average_match_score: float
    shortlisted_candidates: Optional[int] = 0
    hiring_success_rate: Optional[float] = 0.0

class SkillAnalytics(BaseModel):
    data: List[dict]

class RecruitmentTrends(BaseModel):
    data: List[dict]

class ExperienceAnalytics(BaseModel):
    data: List[dict]

# Report Request Schemas
class ReportGenerateRequest(BaseModel):
    job_id: Optional[str] = None
    format: str = "pdf"

class ExportCandidatesRequest(BaseModel):
    format: str = "excel"

class ChatRequest(BaseModel):
    query: str


