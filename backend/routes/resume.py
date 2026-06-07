from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from models.models import Candidate, User, Resume
from models.schemas import CandidateResponse, CandidateUpdate
from database.connection import get_db
from authentication.jwt_handler import get_current_user
from nlp.resume_parser import ResumeParser
from config import settings
from utils.activity_logger import log_activity
import os
import hashlib
from pathlib import Path

router = APIRouter(prefix="/resume", tags=["resume"])

# Create upload directory if it doesn't exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload, validate, parse, and support splitting compiled multi-resume PDF books"""
    try:
        # Enforce Role-Based Access Control
        if current_user.role not in ["admin", "hr"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Only HR and Admins can upload resumes."
            )

        # Validate file extension
        file_ext = file.filename.split('.')[-1].lower()
        if file_ext not in ["pdf", "docx"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File type not supported. Allowed formats: PDF and DOCX only."
            )

        # Read file bytes
        file_bytes = await file.read()
        file_size = len(file_bytes)
        MAX_FILE_SIZE = 25 * 1024 * 1024  # Increase to 25MB to easily support compiled resume books
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File exceeds maximum allowed size of 25MB."
            )

        # Compute SHA-256 hash for duplicate check
        file_hash = hashlib.sha256(file_bytes).hexdigest()
        existing_resume = db.query(Resume).filter(Resume.file_hash == file_hash).first()
        if existing_resume:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Duplicate file detected. This file has already been uploaded as '{existing_resume.file_name}'."
            )

        # Save original file to upload directory
        file_path = os.path.join(settings.UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as f:
            f.write(file_bytes)

        # 1. Page-by-page scanning to detect compiled multi-resume books (PDF only)
        import pdfplumber
        from pypdf import PdfReader, PdfWriter
        import json
        import re
        from datetime import datetime

        candidates_blocks = []

        if file_ext == "pdf":
            try:
                current_block = None
                with pdfplumber.open(file_path) as pdf:
                    for page_idx, page in enumerate(pdf.pages):
                        page_text = page.extract_text() or ""
                        email = ResumeParser.extract_email(page_text)

                        if email:
                            # Start a new candidate block when a new email address is encountered
                            if not current_block or current_block["email"] != email:
                                current_block = {
                                    "email": email,
                                    "page_indices": [page_idx],
                                    "text": page_text
                                }
                                candidates_blocks.append(current_block)
                            else:
                                # Multipage resume for the same email
                                current_block["page_indices"].append(page_idx)
                                current_block["text"] += "\n" + page_text
                        else:
                            # No email found on this page
                            if current_block:
                                # Append to the active candidate
                                current_block["page_indices"].append(page_idx)
                                current_block["text"] += "\n" + page_text
                            else:
                                # Orphan first page: allocate temporary candidate group
                                current_block = {
                                    "email": f"unknown_candidate_{page_idx}@recruitai.com",
                                    "page_indices": [page_idx],
                                    "text": page_text
                                }
                                candidates_blocks.append(current_block)
            except Exception as pdf_err:
                print(f"Error checking for compiled PDF pages: {pdf_err}")

        # 2. Handle Slicing for Compiled Multi-Resume Books
        if len(candidates_blocks) > 1:
            created_candidates = []
            pdf_reader = PdfReader(file_path)

            for idx, block in enumerate(candidates_blocks):
                block_email = block["email"]
                block_text = block["text"]
                page_indices = block["page_indices"]

                # Run NLP parser on this specific segment
                cand_name = ResumeParser.extract_name(block_text)
                cand_phone = ResumeParser.extract_phone(block_text)
                cand_skills = ResumeParser.extract_skills(block_text)
                cand_exp_years, cand_exp_details = ResumeParser.extract_experience(block_text)
                cand_edu = ResumeParser.extract_education(block_text)
                cand_score = len(cand_skills) * 5

                # Physical PDF slicing for candidate
                pdf_writer = PdfWriter()
                for p_idx in page_indices:
                    pdf_writer.add_page(pdf_reader.pages[p_idx])

                safe_name = re.sub(r'[^a-zA-Z0-9]', '_', cand_name)
                slice_filename = f"split_{idx + 1}_{safe_name}_{block_email}.pdf"
                slice_file_path = os.path.join(settings.UPLOAD_DIR, slice_filename)

                with open(slice_file_path, "wb") as slice_f:
                    pdf_writer.write(slice_f)

                # Create separate candidate record in database
                candidate = Candidate(
                    name=cand_name,
                    email=block_email,
                    phone=cand_phone,
                    
                    # Legacy duplicated fields
                    skills_json=json.dumps(cand_skills),
                    education_text=cand_edu,
                    experience_text=cand_exp_details or f"{cand_exp_years} years of experience",
                    resume_score=cand_score,
                    matched_skills_json="[]",
                    missing_skills_json="[]",
                    file_path=slice_file_path,
                    raw_text_excerpt=block_text[:2000],
                    upload_time=datetime.utcnow(),

                    # Standard fields
                    skills=cand_skills,
                    experience_years=cand_exp_years,
                    education=cand_edu,
                    experience_details=cand_exp_details,
                    resume_path=slice_file_path,
                    parsed_content=block_text,
                    score=cand_score,
                    created_by=current_user.id,
                )
                db.add(candidate)
                db.commit()
                db.refresh(candidate)

                # Save individual slice metadata
                slice_hash = hashlib.sha256(open(slice_file_path, 'rb').read()).hexdigest()
                existing_slice = db.query(Resume).filter(Resume.file_hash == slice_hash).first()
                if not existing_slice:
                    resume_meta = Resume(
                        file_name=slice_filename,
                        file_type="pdf",
                        candidate_id=candidate.id,
                        resume_path=slice_file_path,
                        file_hash=slice_hash,
                    )
                    db.add(resume_meta)
                    db.commit()

                # Log activity for this specific candidate
                log_activity(
                    db,
                    current_user.id,
                    current_user.name,
                    "Uploaded Compiled Resume Segment",
                    f"Extracted candidate '{candidate.name}' from compiled portfolio '{file.filename}'"
                )

                created_candidates.append({
                    "id": candidate.id,
                    "name": candidate.name,
                    "email": candidate.email,
                    "skills": candidate.skills,
                    "experience": candidate.experience_years,
                    "score": candidate.score
                })

            # Broadcast real-time notification
            from services.notification_service import notification_manager
            await notification_manager.broadcast(
                notification_type="resume_upload",
                message=f"Compiled resume portfolio parsed successfully. Extracted {len(created_candidates)} individual candidates!",
                data={"total_extracted": len(created_candidates)}
            )

            return {
                "multiple": True,
                "candidates": created_candidates,
                "message": f"Successfully parsed and split compiled resume book into {len(created_candidates)} candidates!"
            }

        # 3. Handle Standard Single-Candidate Resume
        parsed_data = ResumeParser.parse_resume(file_path, file_ext)
        if "error" in parsed_data:
            if os.path.exists(file_path):
                os.remove(file_path)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=parsed_data["error"]
            )

        skills_list = parsed_data.get("skills", [])
        skills_json_str = json.dumps(skills_list)
        edu = parsed_data.get("education", "")
        exp_years = parsed_data.get("experience_years", 0.0)
        exp_details = parsed_data.get("experience_details", "")
        raw_content = parsed_data.get("parsed_content", "")
        calculated_score = len(skills_list) * 5

        candidate = Candidate(
            name=parsed_data.get("name", "Unknown"),
            email=parsed_data.get("email", ""),
            phone=parsed_data.get("phone", ""),
            
            # Legacy/Duplicated Fields
            skills_json=skills_json_str,
            education_text=edu,
            experience_text=exp_details or f"{exp_years} years of experience",
            resume_score=calculated_score,
            matched_skills_json="[]",
            missing_skills_json="[]",
            file_path=file_path,
            raw_text_excerpt=raw_content[:2000] if raw_content else "",
            upload_time=datetime.utcnow(),

            # Standard Fields
            skills=skills_list,
            experience_years=exp_years,
            education=edu,
            experience_details=exp_details,
            resume_path=file_path,
            parsed_content=raw_content,
            score=calculated_score,
            created_by=current_user.id,
        )
        db.add(candidate)
        db.commit()
        db.refresh(candidate)

        # Create Resume metadata record
        resume_meta = Resume(
            file_name=file.filename,
            file_type=file_ext,
            candidate_id=candidate.id,
            resume_path=file_path,
            file_hash=file_hash,
        )
        db.add(resume_meta)
        db.commit()

        # Log Activity
        log_activity(
            db,
            current_user.id,
            current_user.name,
            "Uploaded Resume",
            f"Uploaded resume '{file.filename}' for candidate '{candidate.name}'"
        )

        # Broadcast real-time notification
        from services.notification_service import notification_manager
        await notification_manager.broadcast(
            notification_type="resume_upload",
            message=f"New candidate '{candidate.name}' uploaded and parsed successfully!",
            data={"candidate_id": candidate.id, "candidate_name": candidate.name}
        )

        return {
            "multiple": False,
            "id": candidate.id,
            "name": candidate.name,
            "email": candidate.email,
            "skills": candidate.skills,
            "experience": candidate.experience_years,
            "score": candidate.score,
            "message": "Resume uploaded, verified, parsed, and recorded successfully!"
        }

    except HTTPException as he:
        db.rollback()
        raise he
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during resume uploading: {str(e)}"
        )


@router.post("/{candidate_id}/parse")
async def parse_resume(
    candidate_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Re-parse an existing resume"""
    if current_user.role not in ["admin", "hr"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Only HR and Admins can trigger resume re-parsing."
        )

    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()

    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )

    if not os.path.exists(candidate.resume_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume file not found"
        )

    file_ext = candidate.resume_path.split('.')[-1].lower()
    parsed_data = ResumeParser.parse_resume(candidate.resume_path, file_ext)

    if "error" in parsed_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=parsed_data["error"]
        )

    # Update candidate
    candidate.skills = parsed_data.get("skills", [])
    candidate.experience_years = parsed_data.get("experience_years", 0)
    candidate.education = parsed_data.get("education", "")
    candidate.score = len(parsed_data.get("skills", [])) * 5

    db.commit()
    db.refresh(candidate)

    log_activity(
        db,
        current_user.id,
        current_user.name,
        "Re-parsed Resume",
        f"Re-parsed resume for candidate '{candidate.name}' (ID: {candidate.id})"
    )

    return CandidateResponse.from_orm(candidate)


@router.get("/candidates")
async def get_all_candidates(
    page: int = 1,
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all candidates with pagination"""
    skip = (page - 1) * limit
    candidates = db.query(Candidate).offset(skip).limit(limit).all()
    total = db.query(Candidate).count()

    return {
        "candidates": [CandidateResponse.from_orm(c) for c in candidates],
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit,
    }


@router.get("/candidate/{candidate_id}")
async def get_candidate(
    candidate_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get candidate details with advanced AI analysis"""
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()

    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )

    from services.ai_service import AIService
    from models.models import MatchingResult
    
    # Run Fake Resume Detection
    parsed_text = candidate.parsed_content or ""
    fake_analysis = AIService.detect_fake_resume(parsed_text, candidate.experience_years)
    
    # Get general resume improvement suggestions
    # We can check their missing skills from matching results, if any
    first_match = db.query(MatchingResult).filter(MatchingResult.candidate_id == candidate_id).first()
    missing_skills = first_match.missing_skills if first_match else ["Docker", "AWS", "CI/CD"] # standard fallback skills to suggest
    
    suggestions = AIService.get_resume_suggestions(candidate.skills or [], missing_skills)

    return {
        "id": candidate.id,
        "name": candidate.name,
        "email": candidate.email,
        "phone": candidate.phone,
        "skills": candidate.skills or [],
        "experience_years": candidate.experience_years,
        "education": candidate.education,
        "experience_details": candidate.experience_details,
        "resume_path": candidate.resume_path,
        "score": candidate.score,
        "created_at": candidate.created_at,
        "ai_suggestions": suggestions,
        "ai_fake_analysis": fake_analysis,
        "missing_skills": missing_skills if first_match else []
    }



@router.put("/candidate/{candidate_id}", response_model=CandidateResponse)
async def update_candidate(
    candidate_id: int,
    candidate_update: CandidateUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update candidate information (Admin/HR only)"""
    if current_user.role not in ["admin", "hr"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Only HR and Admins can update candidate details."
        )

    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()

    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )

    update_data = candidate_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(candidate, field, value)

    db.commit()
    db.refresh(candidate)

    log_activity(
        db,
        current_user.id,
        current_user.name,
        "Updated Candidate",
        f"Updated information for candidate '{candidate.name}' (ID: {candidate_id})"
    )

    return CandidateResponse.from_orm(candidate)


@router.delete("/candidate/{candidate_id}")
async def delete_candidate(
    candidate_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete candidate and its related records (Admin/HR only)"""
    if current_user.role not in ["admin", "hr"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Only HR and Admins can delete candidates."
        )

    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )

    name = candidate.name
    # Delete related resumes and matches first to prevent foreign key errors
    db.query(Resume).filter(Resume.candidate_id == candidate_id).delete()
    from models.models import MatchingResult
    db.query(MatchingResult).filter(MatchingResult.candidate_id == candidate_id).delete()
    
    db.delete(candidate)
    db.commit()

    log_activity(
        db,
        current_user.id,
        current_user.name,
        "Deleted Candidate",
        f"Deleted candidate '{name}' (ID: {candidate_id})"
    )

    return {"message": f"Candidate {name} deleted successfully."}
