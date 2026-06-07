from typing import List, Dict, Tuple
import re
from sqlalchemy.orm import Session
from models.models import Candidate, Job, MatchingResult
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

class AIService:
    """Advanced AI features: Suggestions, Fake detection, and HR Chatbot"""

    @staticmethod
    def get_resume_suggestions(candidate_skills: List[str], missing_skills: List[str]) -> List[str]:
        """Generate structured suggestions to improve a candidate's resume"""
        suggestions = []
        
        if not missing_skills:
            return ["Excellent profile! Your resume perfectly matches the job profile requirements. Focus on showcasing leadership or advanced projects."]

        # Core Technical suggestions
        tech_skills = [s for s in missing_skills if s.lower() in [
            "python", "javascript", "typescript", "java", "c++", "c#", "go", "react", "vue.js", "angular",
            "node.js", "django", "fastapi", "spring boot", "postgresql", "mysql", "mongodb", "docker", "kubernetes", "aws", "gcp"
        ]]
        
        if tech_skills:
            suggestions.append(
                f"Gain and showcase technical skills: Focus on learning and adding practical experience with {', '.join(tech_skills[:3])} to your resume."
            )

        # Cloud & DevOps suggestions
        devops_skills = [s for s in missing_skills if s.lower() in ["docker", "kubernetes", "aws", "azure", "gcp", "jenkins", "terraform", "ci/cd"]]
        if devops_skills:
            suggestions.append(
                "Incorporate Cloud & Deployment Experience: Deploy your personal projects or professional work on cloud platforms and mention container technologies like Docker."
            )

        # Standard formatting advice
        suggestions.append(
            "Quantitative Impact: Enhance your project descriptions by adding concrete, measurable achievements (e.g., 'Optimized query efficiency by 35%', 'Reduced page load time by 1.2s')."
        )

        # Certifications advice
        suggestions.append(
            "Professional Certifications: Consider obtaining certifications relevant to missing credentials to demonstrate self-driven validation."
        )

        return suggestions

    @staticmethod
    def detect_fake_resume(text: str, experience_years: float) -> Dict:
        """
        Analyze resume text for anomalies:
        - Word Stuffing / Keyword Stuffing
        - Timeline/Temporal Consistency (unrealistic experience vs timeline)
        - Buzzword Density (excessive technical buzzwords without semantic narrative)
        - Content anomalies
        """
        reasons = []
        risk_score = 0.0
        text_lower = text.lower()

        # 1. Keyword Stuffing Detection (abnormally high repeating tech keywords)
        tech_words = ["python", "java", "react", "sql", "aws", "docker", "kubernetes", "agile", "scrum", "developer"]
        stuffing_detected = False
        for word in tech_words:
            count = len(re.findall(r'\b' + re.escape(word) + r'\b', text_lower))
            if count > 8:  # Word mentioned too many times in first 1000 chars
                stuffing_detected = True
                reasons.append(f"High repetition of tech keyword: '{word}' ({count} occurrences), suggesting keyword stuffing.")
                risk_score += 25.0

        # 2. Timeline Consistency Check (e.g. claims 15 years experience, but lists graduation year in last few years)
        years = re.findall(r'\b(19\d{2}|20\d{2})\b', text)
        if years:
            grad_years = [int(y) for y in years]
            max_year = max(grad_years)
            # If max graduation or work year is very recent but experience is high
            current_year = 2026
            if experience_years > 10 and max_year > (current_year - 5):
                reasons.append(f"Temporal inconsistency: Claiming {experience_years} years of experience but listing recent years up to {max_year}.")
                risk_score += 35.0

        # 3. Jargon / Buzzword Density
        buzzwords = ["synergy", "paradigm", "disruptive", "cutting-edge", "world-class", "innovative", "scalable", "robust", "streamline"]
        buzz_count = sum(1 for b in buzzwords if b in text_lower)
        if buzz_count > 4:
            reasons.append("Unusually high density of general corporate buzzwords without concrete project descriptions.")
            risk_score += 15.0

        # Capping and status
        risk_score = min(risk_score, 100.0)
        is_suspicious = risk_score >= 40.0

        return {
            "is_suspicious": is_suspicious,
            "risk_score": round(risk_score, 2),
            "reasons": reasons if reasons else ["No major anomalies detected. The resume appears to be legitimate."],
            "status": "Suspicious" if is_suspicious else "Verified"
        }

    @staticmethod
    def chat_support(query: str, db: Session) -> Dict:
        """
        AI recruiter chatbot. Parses natural queries to search, rank,
        and recommend candidates from the database.
        """
        candidates = db.query(Candidate).all()
        if not candidates:
            return {
                "response": "Hello! I am RecruitAI Assistant. It looks like you haven't uploaded any resumes yet. Please upload some resumes first so I can assist you in finding candidates!",
                "candidates": []
            }

        query_lower = query.lower()

        # Extract potential skills from the query
        known_skills = [
            "python", "javascript", "typescript", "java", "c++", "go", "react", "angular", "vue",
            "node", "django", "fastapi", "postgresql", "mysql", "mongodb", "docker", "kubernetes", "aws", "devops"
        ]
        
        query_skills = [s for s in known_skills if s in query_lower]
        
        # Check if experience is specified in query (e.g. "5 years", "3+ years")
        exp_match = re.search(r'(\d+)\s*(?:\+)?\s*year', query_lower)
        required_exp = float(exp_match.group(1)) if exp_match else 0.0

        scored_candidates = []
        for cand in candidates:
            cand_skills_lower = [s.lower() for s in (cand.skills or [])]
            
            # Calculate skills score
            skill_score = 0
            if query_skills:
                matched = [s for s in query_skills if s in cand_skills_lower]
                skill_score = (len(matched) / len(query_skills)) * 100
            else:
                # General TF-IDF fallback similarity to query
                cand_text = f"{cand.name} {cand.education} {cand.experience_details or ''} " + " ".join(cand.skills or [])
                vectorizer = TfidfVectorizer(lowercase=True, stop_words='english')
                try:
                    tfidf = vectorizer.fit_transform([query_lower, cand_text.lower()])
                    skill_score = float(cosine_similarity(tfidf[0], tfidf[1])[0][0]) * 100
                except:
                    skill_score = 0.0

            # Experience score
            exp_score = 100.0
            if required_exp > 0:
                if cand.experience_years >= required_exp:
                    exp_score = 100.0
                else:
                    exp_score = (cand.experience_years / required_exp) * 100

            # Combined score
            overall = (skill_score * 0.7) + (exp_score * 0.3)
            scored_candidates.append((cand, overall))

        # Sort candidates
        scored_candidates.sort(key=lambda x: x[1], reverse=True)
        top_cand, top_score = scored_candidates[0]

        # Formulate intelligent AI response
        if top_score > 30:
            skills_str = ", ".join(top_cand.skills[:4]) if top_cand.skills else "no specified skills"
            response_text = (
                f"Based on your query, the best candidate in our database is **{top_cand.name}** "
                f"with a relevance score of **{top_score:.1f}%**. \n\n"
                f"**Why {top_cand.name}?**\n"
                f"- **Experience**: {top_cand.experience_years:.1f} years of relevant experience.\n"
                f"- **Key Skills**: {skills_str}.\n"
                f"- **Education**: {top_cand.education or 'Not specified'}.\n\n"
                f"You can view their full profile in the Candidates section or shortlist them for active roles."
            )
            
            # Include top 3 candidates
            matches_list = []
            for c, score in scored_candidates[:3]:
                if score > 20:
                    matches_list.append({
                        "id": c.id,
                        "name": c.name,
                        "email": c.email,
                        "score": round(score, 1),
                        "experience_years": c.experience_years
                    })
        else:
            response_text = (
                "I couldn't find a direct candidate match for your specific requirements. "
                "However, here is our top candidate overall: \n\n"
                f"**{top_cand.name}** has {top_cand.experience_years:.1f} years of experience and skills including "
                f"{', '.join(top_cand.skills[:3]) if top_cand.skills else 'none'}. You may want to review their profile or "
                "upload more resumes for the matching process."
            )
            matches_list = [{
                "id": top_cand.id,
                "name": top_cand.name,
                "email": top_cand.email,
                "score": round(top_score, 1),
                "experience_years": top_cand.experience_years
            }]

        return {
            "response": response_text,
            "candidates": matches_list
        }
