---
layout: default
---

# AI-Powered Resume Screening & Recruitment Analytics System

<div align="center">

### RecruitAI - Intelligent Recruitment Platform

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An enterprise-grade AI-powered platform for intelligent resume screening, candidate matching, and recruitment analytics.

[Features](#features) • [Tech Stack](#tech-stack) • [Installation](#installation) • [Documentation](#documentation)

</div>

---

## 🎯 Overview

RecruitAI is a complete recruitment analytics platform that leverages artificial intelligence and natural language processing to automate resume screening, match candidates with job descriptions, and provide actionable recruitment insights.

### Key Capabilities

- **Intelligent Resume Parsing** - Automatically extract skills, experience, and education
- **Smart Candidate Matching** - AI-powered matching with job descriptions using TF-IDF and cosine similarity
- **Skill Analytics** - Comprehensive skill gap analysis and trending skills
- **Recruitment Dashboard** - Real-time analytics and KPI tracking
- **ATS Integration** - Export data in multiple formats for existing HR systems
- **Enterprise Security** - JWT authentication, password hashing, and role-based access control

---

## 🚀 Features

### Dashboard & Analytics
- ✅ Real-time KPI monitoring (candidates, jobs, selected/rejected)
- ✅ Interactive charts (bar, pie, line, area charts)
- ✅ Candidate funnel analysis
- ✅ Experience distribution analytics
- ✅ Recruitment trends visualization
- ✅ Top skills analytics

### Resume Processing
- ✅ PDF and DOCX file support
- ✅ Automated resume parsing with spaCy NLP
- ✅ Skill extraction and recognition
- ✅ Contact information extraction
- ✅ Education and experience detection
- ✅ Resume scoring system

### Candidate Management
- ✅ Upload and manage multiple candidates
- ✅ Detailed candidate profiles
- ✅ Skill tracking and analysis
- ✅ Search and filtering
- ✅ Pagination support
- ✅ Candidate comparison

### Job Description Management
- ✅ Create and manage job postings
- ✅ Required skills specification
- ✅ Experience requirement tracking
- ✅ Job-candidate matching

### AI Matching Engine
- ✅ TF-IDF vectorization
- ✅ Cosine similarity scoring
- ✅ Weighted ranking system
- ✅ Skill match percentage calculation
- ✅ Experience matching
- ✅ Recommendation system (High/Medium/Low)

### Reporting & Export
- ✅ PDF report generation
- ✅ Excel/CSV export
- ✅ Candidate data export
- ✅ Recruitment metrics reports

### Authentication & Security
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (Admin, HR, Recruiter)
- ✅ Secure API endpoints
- ✅ CORS protection

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 with React 18
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI
- **Server**: Uvicorn
- **ORM**: SQLAlchemy
- **Database**: MySQL 8.0
- **Authentication**: JWT + PassLib
- **NLP**: spaCy, NLTK
- **ML**: scikit-learn
- **File Processing**: pdfplumber, python-docx
- **Reports**: ReportLab, OpenPyXL

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Reverse Proxy**: Nginx

### Database Schema

```
users
├── id (PK)
├── name
├── email (UNIQUE)
├── password_hash
├── role (hr, admin, recruiter)
├── is_active

candidates
├── id (PK)
├── name
├── email
├── phone
├── skills (JSON)
├── experience_years
├── education
├── resume_path
├── score
├── created_by (FK → users.id)

jobs
├── id (PK)
├── title
├── description
├── required_skills (JSON)
├── experience_required
├── is_active

matching_results
├── id (PK)
├── candidate_id (FK → candidates.id)
├── job_id (FK → jobs.id)
├── match_score
├── matched_skills (JSON)
├── missing_skills (JSON)
├── recommendation (high, medium, low)

reports
├── id (PK)
├── generated_by (FK → users.id)
├── job_id (FK → jobs.id)
├── report_type (pdf, excel)
├── file_path
```

---

## 📦 Installation

### Prerequisites

- Python 3.11+
- Node.js 18+
- MySQL 8.0+
- Docker & Docker Compose (optional)

### Quick Start with Docker

```bash
# Clone the repository
git clone https://github.com/yourusername/resume-screening-system.git
cd resume-screening-system

# Build and start services
docker-compose -f docker/docker-compose.yml up -d

# Database will be initialized automatically
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Manual Setup

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Create .env file
cp .env.example .env
# Edit .env with your database credentials

# Run migrations (tables are created automatically)
python main.py
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api
```

### Authentication Endpoints

#### POST `/auth/signup`
Register a new user
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "role": "hr"
}
```

#### POST `/auth/login`
Login user
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

### Resume Endpoints

#### POST `/resume/upload`
Upload a resume (multipart/form-data)
- File: PDF or DOCX
- Returns: Parsed candidate data

#### GET `/resume/candidates?page=1&limit=10`
Get all candidates with pagination

#### GET `/resume/candidate/{candidate_id}`
Get specific candidate details

### Job Endpoints

#### POST `/job/create`
Create a new job description
```json
{
  "title": "Senior Frontend Developer",
  "description": "Looking for experienced frontend developer...",
  "required_skills": ["React", "TypeScript", "Tailwind"],
  "experience_required": 5
}
```

#### GET `/job/all`
Get all active jobs

#### GET `/job/{job_id}`
Get specific job details

### Matching Endpoints

#### POST `/matching/match/{job_id}`
Match all candidates with a job

#### GET `/matching/results/{job_id}`
Get matching results for a job

### Analytics Endpoints

#### GET `/analytics/dashboard`
Get dashboard statistics

#### GET `/analytics/skills`
Get skills analytics

#### GET `/analytics/trends`
Get recruitment trends

#### GET `/analytics/experience`
Get experience distribution

### Report Endpoints

#### POST `/report/generate`
Generate PDF/Excel report
```json
{
  "job_id": 1,
  "format": "pdf"
}
```

#### POST `/report/export-candidates`
Export all candidates as Excel

---

## 🎨 Frontend Pages

### Public Pages
- **Home** (`/`) - Landing page
- **Login** (`/login`) - User authentication
- **Signup** (`/signup`) - Account registration

### Authenticated Pages
- **Dashboard** (`/dashboard`) - Main analytics dashboard
- **Upload Resume** (`/upload-resume`) - Resume upload interface
- **Candidates** (`/candidates`) - Candidate management
- **Candidate Details** (`/candidates/[id]`) - Individual candidate profile
- **Job Descriptions** (`/job-descriptions`) - Job management
- **Analytics** (`/analytics`) - Detailed analytics
- **Reports** (`/reports`) - Report generation and export

---

## 🤖 NLP & AI Features

### Resume Parsing
- **Entity Recognition**: Extract names, emails, phone numbers using spaCy NER
- **Skill Extraction**: Pattern matching against 100+ skills database
- **Experience Detection**: Regex-based year extraction
- **Education Parsing**: Degree and qualification identification

### Candidate Matching
- **TF-IDF Vectorization**: Text vectorization for semantic analysis
- **Cosine Similarity**: Calculate text similarity between resume and job description
- **Skill Matching**: Percentage-based skill matching
- **Experience Alignment**: Compare candidate experience with requirements

### Ranking Algorithm
```
Overall Match = 
  (Skill Match % × 0.5) +
  (Experience Match % × 0.3) +
  (Text Similarity % × 0.2)
```

---

## 🔐 Security Features

- ✅ **JWT Authentication**: Secure token-based authentication
- ✅ **Password Hashing**: bcrypt for secure password storage
- ✅ **CORS Protection**: Whitelisted origins
- ✅ **Input Validation**: Pydantic models for data validation
- ✅ **SQL Injection Prevention**: Parameterized queries with SQLAlchemy
- ✅ **Role-Based Access**: HR, Admin, and Recruiter roles
- ✅ **File Upload Security**: File type validation
- ✅ **Environment Variables**: Sensitive data in .env files

---

## 📊 Analytics & Reporting

### Dashboard Metrics
- Total candidates and jobs
- Selected vs rejected candidates
- Average match score
- Hiring trends

### Analytics Available
- Top 10 required skills
- Experience distribution (0-2, 2-5, 5-10, 10+ years)
- Recruitment trends (last 5 months)
- Candidate funnel (Applied → Reviewed → Shortlisted → Selected)

### Export Formats
- **PDF**: Professional recruitment reports with tables and metrics
- **Excel**: Detailed candidate data with formatting
- **CSV**: Plain text format for data integration

---

## 🚀 Deployment

### Docker Deployment

```bash
# Build all images
docker-compose -f docker/docker-compose.yml build

# Start all services
docker-compose -f docker/docker-compose.yml up -d

# View logs
docker-compose -f docker/docker-compose.yml logs -f

# Stop services
docker-compose -f docker/docker-compose.yml down
```

### Cloud Deployment

#### AWS
- **Frontend**: AWS S3 + CloudFront
- **Backend**: AWS App Runner or EC2
- **Database**: AWS RDS MySQL

#### Azure
- **Frontend**: Azure Static Web Apps
- **Backend**: Azure App Service
- **Database**: Azure Database for MySQL

#### Google Cloud
- **Frontend**: Cloud Storage + CDN
- **Backend**: Cloud Run
- **Database**: Cloud SQL

---

## 📖 Development Guide

### Project Structure

```
resume-screening-system/
├── frontend/                    # Next.js frontend
│   ├── pages/                  # Routes and pages
│   ├── components/             # React components
│   ├── services/               # API services
│   ├── context/                # Global state
│   ├── charts/                 # Recharts components
│   ├── layouts/                # Layout templates
│   ├── styles/                 # CSS and styling
│   └── package.json
│
├── backend/                     # FastAPI backend
│   ├── routes/                 # API endpoints
│   ├── models/                 # SQLAlchemy & Pydantic models
│   ├── database/               # Database connection
│   ├── authentication/         # JWT & auth
│   ├── nlp/                    # NLP & resume parsing
│   ├── ranking/                # Matching & ranking
│   ├── analytics/              # Analytics service
│   ├── main.py                 # FastAPI app
│   ├── config.py               # Configuration
│   └── requirements.txt
│
├── docker/                      # Docker configuration
│   ├── docker-compose.yml      # Container orchestration
│   ├── Dockerfile.backend      # Backend container
│   └── Dockerfile.frontend     # Frontend container
│
├── uploads/                     # Resume upload storage
├── reports/                     # Generated reports
└── README.md
```

### Development Commands

#### Backend
```bash
# Development server
uvicorn main:app --reload --port 8000

# Run tests
pytest

# Generate database schema
python -c "from database.connection import create_all_tables; create_all_tables()"
```

#### Frontend
```bash
# Development server
npm run dev

# Build
npm run build

# Test
npm run test

# Lint
npm run lint
```

---

## 🔄 Workflow Example

1. **Upload Resumes**
   - HR recruiter uploads PDF/DOCX files
   - System automatically parses and extracts information
   - Candidates added to database

2. **Create Job Description**
   - HR creates job with title, description, and required skills
   - System stores requirements for matching

3. **Match Candidates**
   - System analyzes all candidates against job requirements
   - Calculates match scores using AI/ML
   - Ranks candidates by relevance

4. **Review Results**
   - View candidate matches and scores
   - Review detailed candidate profiles
   - Compare skills with requirements

5. **Generate Reports**
   - Export recruitment analytics
   - Create candidate lists
   - Share insights with stakeholders

---

## 📝 Environment Variables

### Backend (.env)
```
DATABASE_URL=mysql+pymysql://root:Shiva@56@localhost:3306/resume_screening
SECRET_KEY=your-super-secret-key
DEBUG=False
UPLOAD_DIR=uploads/
CORS_ORIGINS=["http://localhost:3000"]
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check MySQL is running
mysql -u root -pShiva@56 -e "SELECT 1"

# Verify database exists
mysql -u root -pShiva@56 -e "SHOW DATABASES"

# Create database manually
mysql -u root -pShiva@56 -e "CREATE DATABASE resume_screening"
```

### File Upload Issues
- Ensure `uploads/` directory exists and is writable
- Check file size limits (default 5MB)
- Supported formats: PDF, DOCX only

### NLP Model Issues
```bash
# Download spaCy model
python -m spacy download en_core_web_sm

# Download NLTK tokenizers
python -m nltk.downloader punkt
```

---

## 📈 Performance Optimization

- **Database Indexing**: Indexes on email, candidate_id, job_id
- **Pagination**: Limit results to prevent large data transfers
- **Caching**: Implement Redis for frequently accessed data
- **File Compression**: Compress reports before download
- **CDN**: Serve frontend static assets via CDN

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 👨‍💼 Author

**RecruitAI Team**

- GitHub: [your-github-profile](https://github.com)
- Email: contact@recruitai.com
- Website: [recruitai.com](https://recruitai.com)

---

## 🙏 Acknowledgments

- FastAPI for the amazing backend framework
- Next.js for the modern frontend framework
- spaCy for NLP capabilities
- The open-source community for incredible tools

---

## 📞 Support

For support, email support@recruitai.com or open an issue on GitHub.

---

**Made with ❤️ for better recruitment**
