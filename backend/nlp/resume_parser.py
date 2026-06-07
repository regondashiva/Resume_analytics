import pdfplumber
import docx
import re
import datetime
from typing import List, Dict, Tuple
import spacy
import nltk

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    import os
    os.system("python -m spacy download en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

class ResumeParser:
    """Parse and extract actual, non-assumed information from resumes"""

    @staticmethod
    def extract_text_from_pdf(file_path: str) -> str:
        """Extract text from PDF"""
        text = ""
        try:
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    text += page.extract_text() or ""
        except Exception as e:
            print(f"Error extracting PDF: {e}")
        return text

    @staticmethod
    def extract_text_from_docx(file_path: str) -> str:
        """Extract text from DOCX"""
        text = ""
        try:
            doc = docx.Document(file_path)
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
        except Exception as e:
            print(f"Error extracting DOCX: {e}")
        return text

    @staticmethod
    def extract_email(text: str) -> str:
        """Extract email from text"""
        pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        matches = re.findall(pattern, text)
        return matches[0] if matches else ""

    @staticmethod
    def extract_phone(text: str) -> str:
        """Extract phone number from text"""
        # Match common international, mobile, and landline formats
        pattern = r'(?:(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10}\b)'
        matches = re.findall(pattern, text)
        return matches[0] if matches else ""

    @staticmethod
    def extract_name(text: str) -> str:
        """Extract name using NER with a robust structural fallback"""
        # 1. Try spaCy NER inside the top 500 characters
        doc = nlp(text[:500])
        for ent in doc.ents:
            if ent.label_ == "PERSON":
                cleaned = ent.text.strip()
                # Exclude noisy entities like document headers, dates, or emails
                if (len(cleaned.split()) >= 2 and 
                    len(cleaned) < 40 and 
                    not any(kw in cleaned.lower() for kw in ['resume', 'cv', 'curriculum', 'page', 'career', 'email', 'phone', 'contact'])):
                    return cleaned

        # 2. Fallback: inspect the first few lines of text
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        for line in lines[:5]:
            # A valid name is usually 2 to 4 words, starts with capital letters, no digits, no symbols
            if (2 <= len(line.split()) <= 4 and 
                re.match(r'^[A-Z][a-zA-Z\s\.\-\,]+$', line) and 
                not any(kw in line.lower() for kw in ['resume', 'curriculum', 'cv', 'email', 'phone', 'mobile', 'address', 'contact', 'summary', 'experience'])):
                return line

        return "Candidate Profile"

    @staticmethod
    def extract_skills(text: str) -> List[str]:
        """Extract matching skills from resume using boundary-safe exact classification"""
        skills_catalog = [
            # Programming Languages
            "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Golang",
            "Ruby", "PHP", "Swift", "Kotlin", "Rust", "Scala", "MATLAB", "Perl", "R", "SQL",
            # Frontend Frameworks & Libraries
            "React", "Vue.js", "Vue", "Angular", "HTML", "CSS", "Tailwind", "TailwindCSS",
            "Bootstrap", "Webpack", "Next.js", "Svelte", "jQuery", "Redux",
            # Backend Frameworks
            "Node.js", "Node", "Express", "Django", "FastAPI", "Flask", "Spring Boot", "Spring",
            "Laravel", "ASP.NET", ".NET", "Ruby on Rails", "Rails", "NestJS",
            # Cloud & DevOps
            "Docker", "Kubernetes", "AWS", "Amazon Web Services", "Azure", "GCP", "Google Cloud",
            "Jenkins", "GitLab CI", "GitHub Actions", "Terraform", "CI/CD", "Ansible", "Nginx",
            # Databases & Caches
            "MySQL", "PostgreSQL", "MongoDB", "Oracle", "SQL Server", "Redis", "Elasticsearch",
            "Firebase", "DynamoDB", "SQLite", "MariaDB", "Cassandra",
            # Testing & Tools
            "Git", "GitHub", "GitLab", "Jira", "Slack", "VS Code", "Postman", "Figma",
            "REST APIs", "RESTful API", "GraphQL", "Docker Compose", "Unix", "Linux",
            # Data Science, ML & AI
            "Machine Learning", "Deep Learning", "NLP", "Natural Language Processing", 
            "Pandas", "NumPy", "Scikit-learn", "TensorFlow", "PyTorch", "Computer Vision",
            "Data Analytics", "Power BI", "Tableau", "Keras", "OpenCV",
            # Management, Soft Skills & PM
            "Agile", "Scrum", "Project Management", "Product Management", "SDLC", "SAFe",
            "Business Analysis", "Communication", "Leadership", "Teamwork", "Problem Solving",
            "Time Management", "Customer Service", "Technical Writing", "Excel", "Office"
        ]

        text_lower = text.lower()
        found_skills = []

        for skill in skills_catalog:
            skill_lower = skill.lower()
            
            # Use boundary checks to prevent false substrings: e.g. "go" in "google"
            # or "c" in "react"
            if len(skill_lower) <= 3:
                # Require absolute word boundaries for short acronyms
                pattern = r'\b' + re.escape(skill_lower) + r'\b'
                if re.search(pattern, text_lower):
                    found_skills.append(skill)
            else:
                # Substring check is safe for longer multi-character skill phrases
                if skill_lower in text_lower:
                    found_skills.append(skill)

        # Normalize duplicated variations
        normalized_skills = []
        for s in found_skills:
            if s == "Golang":
                normalized_skills.append("Go")
            elif s == "Vue":
                normalized_skills.append("Vue.js")
            elif s == "Node":
                normalized_skills.append("Node.js")
            elif s == "TailwindCSS":
                normalized_skills.append("Tailwind")
            else:
                normalized_skills.append(s)

        return list(sorted(set(normalized_skills)))

    @staticmethod
    def extract_experience(text: str) -> Tuple[float, str]:
        """Extract years of experience using multiple regex patterns"""
        text_lower = text.lower()
        years = 0.0

        # Pattern 1: Direct statements like "5 years of experience", "3+ years", "8 yrs exp"
        pattern_direct = r'(\d+(?:\.\d+)?)\s*(?:\+)?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp|work|industry)'
        matches_direct = re.findall(pattern_direct, text_lower)
        if matches_direct:
            try:
                years = max(years, float(matches_direct[0]))
            except ValueError:
                pass

        # Pattern 2: Year date ranges like "2018 - 2022" or "2015 to Present"
        pattern_ranges = r'\b(19\d\d|20\d\d)\s*[-–—to]+\s*(19\d\d|20\d\d|present|current)\b'
        matches_ranges = re.findall(pattern_ranges, text_lower)
        calculated_years = 0.0
        current_year = datetime.datetime.now().year
        
        for start, end in matches_ranges:
            try:
                start_yr = int(start)
                if end in ['present', 'current']:
                    end_yr = current_year
                else:
                    end_yr = int(end)
                diff = end_yr - start_yr
                if 0 < diff < 40:
                    calculated_years += diff
            except Exception:
                pass

        if calculated_years > 0:
            years = max(years, calculated_years)
            
        # Limit to reasonable career length
        years = min(years, 50.0)

        # Build clean experience details summary lines
        experience_lines = []
        lines = text.split('\n')
        keywords = ['experience', 'work history', 'employment', 'position', 'role', 'job', 'analyst', 'developer', 'engineer', 'manager', 'lead']
        for line in lines:
            if any(kw in line.lower() for kw in keywords) and len(line.strip()) > 10:
                experience_lines.append(line.strip())

        exp_details = "\n".join(experience_lines[:12]) if experience_lines else "Experience parsed from resume text"
        return float(years), exp_details

    @staticmethod
    def extract_education(text: str) -> str:
        """Extract education credentials and major studies"""
        education_keywords = [
            'bachelor', 'master', 'mba', 'phd', 'b.s.', 'm.s.', 'b.a.', 'm.a.',
            'degree', 'university', 'college', 'institute', 'polytechnic', 'school',
            'b.tech', 'm.tech', 'bca', 'mca', 'graduate', 'diploma'
        ]
        lines = text.split('\n')
        education_lines = []

        for line in lines:
            cleaned = line.strip()
            if any(keyword.lower() in cleaned.lower() for keyword in education_keywords) and len(cleaned) > 8:
                education_lines.append(cleaned)

        return "\n".join(education_lines[:8]) if education_lines else "Education details parsed from resume text"

    @staticmethod
    def parse_resume(file_path: str, file_type: str) -> Dict:
        """Parse complete resume"""
        try:
            # Extract text based on file type
            if file_type == "pdf":
                text = ResumeParser.extract_text_from_pdf(file_path)
            elif file_type == "docx":
                text = ResumeParser.extract_text_from_docx(file_path)
            else:
                return {"error": "Unsupported file type"}

            # Validate text length
            if not text or len(text.strip()) < 10:
                return {"error": "Could not extract readable text from the document. Ensure it is not a scanned image."}

            # Extract information
            name = ResumeParser.extract_name(text)
            email = ResumeParser.extract_email(text)
            phone = ResumeParser.extract_phone(text)
            skills = ResumeParser.extract_skills(text)
            experience, exp_details = ResumeParser.extract_experience(text)
            education = ResumeParser.extract_education(text)

            return {
                "name": name,
                "email": email,
                "phone": phone,
                "skills": skills,
                "experience_years": experience,
                "experience_details": exp_details,
                "education": education,
                "parsed_content": text,  # Capture the full extracted text for complete high-quality matchings!
            }

        except Exception as e:
            return {"error": str(e)}
