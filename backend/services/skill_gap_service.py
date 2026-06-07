from typing import List, Dict, Tuple
from models.models import Candidate, Job

# Synonym groupings for smart semantic skill equivalence checks
SYNONYMS = {
    "react": ["reactjs", "react.js", "react framework"],
    "node": ["nodejs", "node.js"],
    "vue": ["vuejs", "vue.js"],
    "angular": ["angularjs", "angular.js"],
    "postgre": ["postgresql", "postgres"],
    "mongo": ["mongodb", "mongo db"],
    "aws": ["amazon web services", "aws cloud"],
    "gcp": ["google cloud", "google cloud platform"],
    "k8s": ["kubernetes", "k8s orchestrator"],
    "docker": ["docker containers"],
    "fastapi": ["fast api"],
    "ml": ["machine learning", "ai/ml"],
    "dl": ["deep learning"],
    "nlp": ["natural language processing"],
    "powerbi": ["power bi", "power-bi"],
    "excel": ["microsoft excel", "ms excel"],
    "sql": ["sql database", "relational database", "mysql", "sql server"]
}

# Curated premium training course directory for learning path recommendations
COURSE_RECOMMENDATIONS = {
    "python": {"course": "Complete Python Bootcamp (Udemy)", "duration_days": 20, "level": "Beginner to Intermediate"},
    "javascript": {"course": "The Complete JavaScript Course 2026 (Udemy)", "duration_days": 18, "level": "Beginner to Advanced"},
    "typescript": {"course": "Understanding TypeScript (Udemy)", "duration_days": 10, "level": "Intermediate"},
    "react": {"course": "React - The Complete Guide (Udemy)", "duration_days": 22, "level": "Intermediate"},
    "vue": {"course": "Vue.js 3 Academy (Udemy)", "duration_days": 15, "level": "Intermediate"},
    "node": {"course": "Node.js Developer BootCamp (Udemy)", "duration_days": 20, "level": "Intermediate"},
    "fastapi": {"course": "FastAPI - The Complete Course (Udemy)", "duration_days": 12, "level": "Intermediate"},
    "django": {"course": "Django Web Development with Python (Coursera)", "duration_days": 25, "level": "Intermediate"},
    "flask": {"course": "Flask Web Development (Udemy)", "duration_days": 10, "level": "Beginner"},
    "postgresql": {"course": "SQL & PostgreSQL Bootcamp (Udemy)", "duration_days": 12, "level": "Beginner"},
    "mongodb": {"course": "MongoDB - The Complete Developer's Guide (Udemy)", "duration_days": 14, "level": "Intermediate"},
    "docker": {"course": "Docker Technologies for DevOps (Udemy)", "duration_days": 8, "level": "Intermediate"},
    "kubernetes": {"course": "Kubernetes Certified Administrator (CKA)", "duration_days": 25, "level": "Advanced"},
    "aws": {"course": "AWS Certified Solutions Architect (Cloud Academy)", "duration_days": 30, "level": "Intermediate to Advanced"},
    "azure": {"course": "Microsoft Azure Fundamentals (Coursera)", "duration_days": 15, "level": "Beginner"},
    "gcp": {"course": "GCP Cloud Architect Bootcamp (Coursera)", "duration_days": 20, "level": "Intermediate"},
    "machine learning": {"course": "Machine Learning Specialization by Andrew Ng (Coursera)", "duration_days": 40, "level": "Intermediate"},
    "deep learning": {"course": "Deep Learning Specialization (Coursera)", "duration_days": 45, "level": "Advanced"},
    "nlp": {"course": "Natural Language Processing in TensorFlow (Coursera)", "duration_days": 30, "level": "Advanced"},
    "git": {"course": "Git & GitHub Complete Guide (Udemy)", "duration_days": 5, "level": "Beginner"},
    "tableau": {"course": "Tableau 2026 A-Z: Hands-on Academy (Udemy)", "duration_days": 15, "level": "Beginner to Intermediate"},
    "power bi": {"course": "Power BI Dashboard Fundamentals (Coursera)", "duration_days": 15, "level": "Beginner to Intermediate"},
    "scrum": {"course": "Scrum Master Certification Prep (Udemy)", "duration_days": 7, "level": "Beginner"},
    "agile": {"course": "Agile PM Foundations (Coursera)", "duration_days": 10, "level": "Beginner"}
}


class SkillGapService:
    """Compare candidate skills against job description and recommend educational roadmap"""

    @staticmethod
    def is_skill_equivalent(candidate_skill: str, required_skill: str) -> bool:
        """Helper to check if candidate's skill is equivalent to a required skill"""
        c_clean = candidate_skill.lower().strip()
        r_clean = required_skill.lower().strip()

        if c_clean == r_clean:
            return True

        # Check substring match
        if c_clean in r_clean or r_clean in c_clean:
            return True

        # Check synonym equivalence groups
        for key, syns in SYNONYMS.items():
            if (c_clean == key or c_clean in syns) and (r_clean == key or r_clean in syns):
                return True

        return False

    @staticmethod
    def get_course_recommendation(skill: str) -> Dict:
        """Fetch course recommendation details for a given skill"""
        skill_lower = skill.lower().strip()
        
        # Try direct match or key in skill / skill in key
        for key, val in COURSE_RECOMMENDATIONS.items():
            if key in skill_lower or skill_lower in key:
                return val

        # Fallback dynamic recommendation
        return {
            "course": f"{skill} Mastery Certification (Pluralsight)",
            "duration_days": 15,
            "level": "Intermediate"
        }

    @classmethod
    def generate_skill_gap_report(cls, candidate: Candidate, job: Job) -> Dict:
        """Generate comprehensive skill gap profile and step-by-step roadmap"""
        cand_skills = candidate.skills or []
        req_skills = job.required_skills or []

        matched_skills = []
        missing_skills = []

        # Categorize candidate skills
        for req in req_skills:
            matched = False
            for cand in cand_skills:
                if cls.is_skill_equivalent(cand, req):
                    matched = True
                    matched_skills.append(req)
                    break
            if not matched:
                missing_skills.append(req)

        # Build educational roadmap
        roadmap = []
        total_duration = 0
        step_counter = 1

        for skill in missing_skills:
            rec = cls.get_course_recommendation(skill)
            roadmap.append({
                "step": step_counter,
                "skill": skill,
                "course": rec["course"],
                "duration_days": rec["duration_days"],
                "level": rec["level"]
            })
            total_duration += rec["duration_days"]
            step_counter += 1

        # Check for foundational/general skills if candidate matches very poorly
        if len(matched_skills) == 0 and len(req_skills) > 0:
            # Inject a foundational developer practice course as Step 1
            git_rec = COURSE_RECOMMENDATIONS["git"]
            roadmap.insert(0, {
                "step": 1,
                "skill": "Git & Code Collaboration",
                "course": git_rec["course"],
                "duration_days": git_rec["duration_days"],
                "level": git_rec["level"]
            })
            total_duration += git_rec["duration_days"]
            # Shift other steps
            for idx in range(1, len(roadmap)):
                roadmap[idx]["step"] = idx + 1

        # Calculate a robust similarity score
        skill_match_percentage = 100.0
        if len(req_skills) > 0:
            skill_match_percentage = (len(matched_skills) / len(req_skills)) * 100.0

        return {
            "candidate_id": candidate.id,
            "candidate_name": candidate.name,
            "job_id": job.id,
            "job_title": job.title,
            "job_department": job.department,
            "skills_match_score": round(skill_match_percentage, 1),
            "matched_skills": list(set(matched_skills)),
            "missing_skills": list(set(missing_skills)),
            "roadmap": roadmap,
            "estimated_completion_time_days": total_duration
        }
