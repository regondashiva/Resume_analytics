from typing import List, Dict, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

class SkillMatcher:
    """Match candidate skills with job requirements"""

    @staticmethod
    def calculate_skill_match(candidate_skills: List[str], required_skills: List[str]) -> Tuple[float, List[str], List[str]]:
        """
        Calculate skill match percentage
        Returns: (match_percentage, matched_skills, missing_skills)
        """
        candidate_skills_lower = [s.lower() for s in candidate_skills]
        required_skills_lower = [s.lower() for s in required_skills]

        matched = [s for s in required_skills if s.lower() in candidate_skills_lower]
        missing = [s for s in required_skills if s.lower() not in candidate_skills_lower]

        if len(required_skills) == 0:
            match_percentage = 100.0
        else:
            match_percentage = (len(matched) / len(required_skills)) * 100

        return match_percentage, matched, missing

    @staticmethod
    def calculate_text_similarity(text1: str, text2: str) -> float:
        """Calculate similarity between two texts using TF-IDF"""
        try:
            vectorizer = TfidfVectorizer(lowercase=True, stop_words='english')
            tfidf_matrix = vectorizer.fit_transform([text1, text2])
            similarity = cosine_similarity(tfidf_matrix[0], tfidf_matrix[1])[0][0]
            return float(similarity) * 100
        except:
            return 0.0

    @staticmethod
    def calculate_experience_match(candidate_years: float, required_years: float) -> float:
        """
        Calculate experience match
        If candidate has more experience than required, it's a better match
        """
        if required_years == 0:
            return 100.0

        if candidate_years >= required_years:
            return 100.0
        else:
            return (candidate_years / required_years) * 100

    @staticmethod
    def calculate_overall_match(
        skill_match: float,
        experience_match: float,
        text_similarity: float,
        skill_weight: float = 0.5,
        experience_weight: float = 0.3,
        text_weight: float = 0.2
    ) -> float:
        """Calculate weighted overall match score"""
        overall = (
            (skill_match * skill_weight) +
            (experience_match * experience_weight) +
            (text_similarity * text_weight)
        )
        return min(overall, 100.0)  # Cap at 100


class CandidateRanker:
    """Rank candidates based on match scores"""

    @staticmethod
    def rank_candidates(matches: List[Dict]) -> List[Dict]:
        """Rank candidates by match score"""
        sorted_matches = sorted(matches, key=lambda x: x['match_score'], reverse=True)

        for rank, match in enumerate(sorted_matches, 1):
            match['overall_rank'] = rank
            # Assign recommendation
            if match['match_score'] >= 80:
                match['recommendation'] = 'high'
            elif match['match_score'] >= 60:
                match['recommendation'] = 'medium'
            else:
                match['recommendation'] = 'low'

        return sorted_matches

    @staticmethod
    def get_recommendation(match_score: float) -> str:
        """Get recommendation based on match score"""
        if match_score >= 80:
            return 'high'
        elif match_score >= 60:
            return 'medium'
        else:
            return 'low'
