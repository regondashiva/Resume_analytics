from sqlalchemy import Column, Integer, String, Text, Float, DateTime, Boolean, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database.connection import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="hr")  # hr, admin, recruiter
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    candidates = relationship("Candidate", back_populates="created_by_user")


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    phone = Column(String(64))
    
    # Legacy/Duplicated Columns
    skills_json = Column(Text)
    education_text = Column(Text)
    experience_text = Column(Text)
    resume_score = Column(Float, default=0)
    matched_skills_json = Column(Text, default="[]")
    missing_skills_json = Column(Text, default="[]")
    file_path = Column(String(1024))
    raw_text_excerpt = Column(Text)
    upload_time = Column(DateTime, default=datetime.utcnow)

    # Standard Columns
    skills = Column(JSON)  # List of skills
    experience_years = Column(Float, default=0)
    education = Column(Text)
    experience_details = Column(Text)
    resume_path = Column(String(500))
    parsed_content = Column(Text)
    score = Column(Float, default=0)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    created_by_user = relationship("User", back_populates="candidates")
    matches = relationship("MatchingResult", back_populates="candidate")


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    required_skills = Column(JSON)  # List of required skills
    experience_required = Column(Float, default=0)
    qualifications = Column(Text)
    department = Column(String(100), default="Engineering")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    matches = relationship("MatchingResult", back_populates="job")


class MatchingResult(Base):
    __tablename__ = "matching_results"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    match_score = Column(Float, default=0)  # 0-100
    matched_skills = Column(JSON)  # Skills that match
    missing_skills = Column(JSON)  # Skills missing
    experience_match = Column(Float, default=0)  # Experience match percentage
    overall_rank = Column(Integer)
    recommendation = Column(String(50))  # high, medium, low
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    candidate = relationship("Candidate", back_populates="matches")
    job = relationship("Job", back_populates="matches")


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    generated_by = Column(Integer, ForeignKey("users.id"))
    job_id = Column(Integer, ForeignKey("jobs.id"))
    report_type = Column(String(50))  # pdf, excel
    file_path = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String(255), nullable=False)
    upload_date = Column(DateTime, default=datetime.utcnow)
    file_type = Column(String(50), nullable=False)  # pdf, docx
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=True)
    resume_path = Column(String(500), nullable=False)
    file_hash = Column(String(64), unique=True, nullable=True)

    # Relationships
    candidate = relationship("Candidate")


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_name = Column(String(255))
    action = Column(String(255), nullable=False)
    details = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationship
    user = relationship("User")
