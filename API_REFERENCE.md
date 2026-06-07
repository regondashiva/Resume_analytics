# API Reference Documentation

## Base URL

```
http://localhost:8000/api
```

## Authentication

All endpoints except `/auth/signup` and `/auth/login` require:

```
Authorization: Bearer <access_token>
```

## Response Format

All responses follow this format:

```json
{
  "data": {},
  "message": "Success",
  "status_code": 200
}
```

---

## Authentication Endpoints

### POST /auth/signup

Register a new user

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "role": "hr"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "hr",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00"
  }
}
```

### POST /auth/login

Authenticate user

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "hr",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00"
  }
}
```

### GET /auth/me

Get current user info

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "hr",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00"
}
```

---

## Resume Endpoints

### POST /resume/upload

Upload and parse a resume

**Content-Type:** multipart/form-data

**Parameters:**
- `file` (File) - PDF or DOCX file

**Response:**
```json
{
  "id": 1,
  "name": "Jane Smith",
  "email": "jane@example.com",
  "skills": ["Python", "JavaScript", "React"],
  "experience": 5,
  "score": 75,
  "message": "Resume uploaded and parsed successfully"
}
```

### GET /resume/candidates

Get all candidates with pagination

**Query Parameters:**
- `page` (int, default: 1) - Page number
- `limit` (int, default: 10) - Results per page

**Response:**
```json
{
  "candidates": [
    {
      "id": 1,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "+1234567890",
      "skills": ["Python", "JavaScript"],
      "experience_years": 5,
      "education": "B.S. Computer Science",
      "resume_path": "uploads/resume_1.pdf",
      "score": 75,
      "created_at": "2024-01-15T10:30:00"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 10,
  "total_pages": 5
}
```

### GET /resume/candidate/{candidate_id}

Get candidate details

**Parameters:**
- `candidate_id` (int, path) - Candidate ID

**Response:**
```json
{
  "id": 1,
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "skills": ["Python", "JavaScript", "React", "Node.js"],
  "experience_years": 5,
  "education": "B.S. Computer Science",
  "resume_path": "uploads/resume_1.pdf",
  "score": 75,
  "created_at": "2024-01-15T10:30:00"
}
```

### PUT /resume/candidate/{candidate_id}

Update candidate information

**Parameters:**
- `candidate_id` (int, path) - Candidate ID

**Request Body:**
```json
{
  "skills": ["Python", "JavaScript", "React", "TypeScript"],
  "experience_years": 6,
  "education": "B.S. Computer Science",
  "score": 80
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Jane Smith",
  "email": "jane@example.com",
  "skills": ["Python", "JavaScript", "React", "TypeScript"],
  "experience_years": 6,
  "score": 80
}
```

---

## Job Endpoints

### POST /job/create

Create a new job description

**Request Body:**
```json
{
  "title": "Senior Frontend Developer",
  "description": "We are looking for an experienced frontend developer with expertise in React and TypeScript...",
  "required_skills": ["React", "TypeScript", "Tailwind CSS"],
  "experience_required": 5,
  "qualifications": "B.S. in Computer Science or equivalent"
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Senior Frontend Developer",
  "description": "We are looking for an experienced frontend developer...",
  "required_skills": ["React", "TypeScript", "Tailwind CSS"],
  "experience_required": 5,
  "qualifications": "B.S. in Computer Science or equivalent",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00"
}
```

### GET /job/all

Get all active jobs

**Response:**
```json
{
  "jobs": [
    {
      "id": 1,
      "title": "Senior Frontend Developer",
      "description": "...",
      "required_skills": ["React", "TypeScript"],
      "experience_required": 5,
      "is_active": true,
      "created_at": "2024-01-15T10:30:00"
    }
  ],
  "total": 5
}
```

### GET /job/{job_id}

Get specific job details

**Parameters:**
- `job_id` (int, path) - Job ID

**Response:**
```json
{
  "id": 1,
  "title": "Senior Frontend Developer",
  "description": "...",
  "required_skills": ["React", "TypeScript"],
  "experience_required": 5,
  "qualifications": "B.S. in Computer Science",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00"
}
```

### PUT /job/{job_id}

Update job description

**Parameters:**
- `job_id` (int, path) - Job ID

**Request Body:**
```json
{
  "title": "Senior Frontend Developer (Updated)",
  "required_skills": ["React", "TypeScript", "Tailwind CSS", "GraphQL"]
}
```

### DELETE /job/{job_id}

Delete/deactivate a job

**Parameters:**
- `job_id` (int, path) - Job ID

**Response:**
```json
{
  "message": "Job deleted successfully"
}
```

---

## Matching Endpoints

### POST /matching/match/{job_id}

Match all candidates with a job

**Parameters:**
- `job_id` (int, path) - Job ID

**Response:**
```json
{
  "job_id": 1,
  "total_matches": 45,
  "matches": [
    {
      "candidate_id": 1,
      "candidate_name": "Jane Smith",
      "match_score": 92.5,
      "recommendation": "high"
    },
    {
      "candidate_id": 2,
      "candidate_name": "John Davis",
      "match_score": 78.3,
      "recommendation": "medium"
    }
  ],
  "message": "Matched 45 candidates"
}
```

### GET /matching/results/{job_id}

Get matching results for a job

**Parameters:**
- `job_id` (int, path) - Job ID

**Response:**
```json
{
  "job_id": 1,
  "total_matches": 45,
  "matches": [
    {
      "id": 1,
      "candidate_id": 1,
      "job_id": 1,
      "match_score": 92.5,
      "matched_skills": ["React", "TypeScript", "Tailwind CSS"],
      "missing_skills": [],
      "experience_match": 100,
      "recommendation": "high",
      "created_at": "2024-01-15T10:30:00"
    }
  ]
}
```

### GET /matching/candidate/{candidate_id}/job/{job_id}

Get match details for a candidate and job

**Parameters:**
- `candidate_id` (int, path) - Candidate ID
- `job_id` (int, path) - Job ID

**Response:**
```json
{
  "id": 1,
  "candidate_id": 1,
  "job_id": 1,
  "match_score": 92.5,
  "matched_skills": ["React", "TypeScript", "Tailwind CSS"],
  "missing_skills": [],
  "experience_match": 100,
  "recommendation": "high",
  "created_at": "2024-01-15T10:30:00"
}
```

---

## Analytics Endpoints

### GET /analytics/dashboard

Get dashboard statistics

**Response:**
```json
{
  "total_candidates": 45,
  "total_jobs": 5,
  "selected_candidates": 12,
  "rejected_candidates": 15,
  "average_match_score": 78.5
}
```

### GET /analytics/skills

Get skills analytics

**Response:**
```json
{
  "data": [
    {
      "name": "React",
      "count": 38
    },
    {
      "name": "JavaScript",
      "count": 35
    },
    {
      "name": "TypeScript",
      "count": 28
    }
  ]
}
```

### GET /analytics/experience

Get experience distribution

**Response:**
```json
{
  "data": [
    {
      "years": "0-2",
      "candidates": 8
    },
    {
      "years": "2-5",
      "candidates": 15
    },
    {
      "years": "5-10",
      "candidates": 18
    },
    {
      "years": "10+",
      "candidates": 4
    }
  ]
}
```

### GET /analytics/trends

Get recruitment trends

**Response:**
```json
{
  "data": [
    {
      "month": "Jan",
      "applications": 45,
      "selected": 8
    },
    {
      "month": "Feb",
      "applications": 52,
      "selected": 10
    }
  ]
}
```

### GET /analytics/funnel/{job_id}

Get candidate funnel for a job

**Parameters:**
- `job_id` (int, path) - Job ID

**Response:**
```json
{
  "data": [
    {
      "name": "Applied",
      "value": 100
    },
    {
      "name": "Reviewed",
      "value": 70
    },
    {
      "name": "Shortlisted",
      "value": 40
    },
    {
      "name": "Selected",
      "value": 12
    }
  ]
}
```

---

## Report Endpoints

### POST /report/generate

Generate PDF or Excel report

**Request Body:**
```json
{
  "job_id": 1,
  "format": "pdf"
}
```

**Response:**
Binary file (PDF or Excel)

### POST /report/export-candidates

Export all candidates as Excel

**Request Body:**
```json
{
  "format": "excel"
}
```

**Response:**
Binary Excel file

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "detail": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "detail": "Access denied"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## Rate Limiting

Rate limits are applied per user:
- 100 requests per minute
- 1000 requests per hour

---

## Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page` (int, default: 1)
- `limit` (int, default: 10, max: 100)

**Response Format:**
```json
{
  "items": [],
  "total": 100,
  "page": 1,
  "limit": 10,
  "total_pages": 10
}
```

---

**Last Updated**: January 2024
