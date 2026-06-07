from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from models.models import Candidate, Job, MatchingResult, User
from models.schemas import MatchingResultResponse, ChatRequest
from database.connection import get_db
from authentication.jwt_handler import get_current_user
from ranking.matcher import SkillMatcher, CandidateRanker

router = APIRouter(prefix="/matching", tags=["matching"])


@router.post("/match/{job_id}")
async def match_candidates(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Match all candidates with a job"""
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    candidates = db.query(Candidate).all()
    matches = []

    for candidate in candidates:
        # Calculate skill match
        skill_match, matched_skills, missing_skills = SkillMatcher.calculate_skill_match(
            candidate.skills or [],
            job.required_skills or []
        )

        # Calculate experience match
        experience_match = SkillMatcher.calculate_experience_match(
            candidate.experience_years,
            job.experience_required
        )

        # Calculate text similarity
        text_similarity = SkillMatcher.calculate_text_similarity(
            candidate.parsed_content or "",
            job.description
        )

        # Calculate overall match
        overall_match = SkillMatcher.calculate_overall_match(
            skill_match,
            experience_match,
            text_similarity
        )

        # Check if match already exists
        existing_match = db.query(MatchingResult).filter(
            MatchingResult.candidate_id == candidate.id,
            MatchingResult.job_id == job_id
        ).first()

        if existing_match:
            existing_match.match_score = overall_match
            existing_match.matched_skills = matched_skills
            existing_match.missing_skills = missing_skills
            existing_match.experience_match = experience_match
            existing_match.recommendation = "high" if overall_match >= 50 else "medium" if overall_match >= 35 else "low"
            db.commit()
        else:
            # Create new matching result
            match_result = MatchingResult(
                candidate_id=candidate.id,
                job_id=job_id,
                match_score=overall_match,
                matched_skills=matched_skills,
                missing_skills=missing_skills,
                experience_match=experience_match,
                recommendation="high" if overall_match >= 50 else "medium" if overall_match >= 35 else "low",
            )
            db.add(match_result)
            db.commit()

        matches.append({
            "candidate_id": candidate.id,
            "candidate_name": candidate.name,
            "match_score": overall_match,
            "recommendation": "high" if overall_match >= 50 else "medium" if overall_match >= 35 else "low",
        })

    # Rank candidates
    ranked_matches = CandidateRanker.rank_candidates(matches)

    # Broadcast real-time notification
    from services.notification_service import notification_manager
    await notification_manager.broadcast(
        notification_type="candidate_match",
        message=f"Candidate matching calculations executed successfully for '{job.title}'!",
        data={"job_id": job_id, "job_title": job.title, "total_matches": len(ranked_matches)}
    )

    return {
        "job_id": job_id,
        "total_matches": len(ranked_matches),
        "matches": ranked_matches[:10],  # Return top 10
        "message": f"Matched {len(ranked_matches)} candidates"
    }


@router.get("/results/{job_id}")
async def get_match_results(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get matching results for a job"""
    # Enforce role-based restrictions for Recruiter: see only shortlisted
    if current_user.role == "recruiter":
        matches = db.query(MatchingResult).filter(
            MatchingResult.job_id == job_id,
            (MatchingResult.recommendation == "high") | (MatchingResult.match_score >= 50)
        ).order_by(MatchingResult.match_score.desc()).all()
    else:
        matches = db.query(MatchingResult).filter(
            MatchingResult.job_id == job_id
        ).order_by(MatchingResult.match_score.desc()).all()

    result = []
    for m in matches:
        cand = m.candidate
        result.append({
            "id": m.id,
            "candidate_id": m.candidate_id,
            "candidate_name": cand.name if cand else "Unknown",
            "candidate_email": cand.email if cand else "",
            "candidate_skills": cand.skills if cand else [],
            "job_id": m.job_id,
            "match_score": m.match_score,
            "matched_skills": m.matched_skills,
            "missing_skills": m.missing_skills,
            "experience_match": m.experience_match,
            "recommendation": m.recommendation,
            "created_at": m.created_at,
        })

    return {
        "job_id": job_id,
        "total_matches": len(result),
        "matches": result,
    }


@router.get("/candidate/{candidate_id}/job/{job_id}")
async def get_candidate_job_match(
    candidate_id: int,
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get match details for a candidate and job"""
    # Enforce Recruiter restriction
    if current_user.role == "recruiter":
        match = db.query(MatchingResult).filter(
            MatchingResult.candidate_id == candidate_id,
            MatchingResult.job_id == job_id
        ).first()
        if match and match.recommendation != "high" and match.match_score < 50:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Recruiters can only access details of shortlisted candidates."
            )
    
    match = db.query(MatchingResult).filter(
        MatchingResult.candidate_id == candidate_id,
        MatchingResult.job_id == job_id
    ).first()

    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Match not found"
        )

    return MatchingResultResponse.from_orm(match)


@router.get("/skill-gap/candidate/{candidate_id}/job/{job_id}")
async def get_skill_gap_report(
    candidate_id: int,
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate and return a personalized skill gap roadmap and training courses"""
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    job = db.query(Job).filter(Job.id == job_id).first()

    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found"
        )
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )

    # Recruiter check
    if current_user.role == "recruiter":
        # Check matching score first
        match = db.query(MatchingResult).filter(
            MatchingResult.candidate_id == candidate_id,
            MatchingResult.job_id == job_id
        ).first()
        if match and match.recommendation != "high" and match.match_score < 50:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied. Recruiters can only access profiles and gap reports of shortlisted candidates."
            )

    from services.skill_gap_service import SkillGapService
    report = SkillGapService.generate_skill_gap_report(candidate, job)

    from utils.activity_logger import log_activity
    log_activity(
        db,
        current_user.id,
        current_user.name,
        "Generated Skill Gap Report",
        f"Analyzed skill gaps for '{candidate.name}' against job '{job.title}'"
    )

    return report


@router.post("/chatbot")
async def chat_support(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """AI Assistant Chatbot endpoint for recruiters"""
    from services.ai_service import AIService
    return AIService.chat_support(payload.query, db)

