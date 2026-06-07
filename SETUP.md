# Setup & Installation Guide

## Quick Start Guide

This guide will help you set up the RecruitAI system on your local machine.

## Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- MySQL 8.0 or higher
- Git

## Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/resume-screening-system.git
cd resume-screening-system
```

## Step 2: Database Setup

### Option A: Using MySQL Command Line

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE resume_screening CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create user (optional)
CREATE USER 'recruit_user'@'localhost' IDENTIFIED BY 'recruit_pass';
GRANT ALL PRIVILEGES ON resume_screening.* TO 'recruit_user'@'localhost';
FLUSH PRIVILEGES;

# Exit
EXIT;
```

### Option B: Using Script (Linux/Mac)

```bash
chmod +x backend/init_db.sh
./backend/init_db.sh
```

## Step 3: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Create .env file with correct database credentials
cp .env.example .env

# Edit .env file with your configuration
nano .env  # or use your preferred editor

# Run the application
python main.py
```

The backend will be available at: `http://localhost:8000`

**API Documentation**: `http://localhost:8000/docs`

## Step 4: Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local

# Run development server
npm run dev
```

The frontend will be available at: `http://localhost:3000`

## Step 5: Verify Installation

1. Open frontend in browser: `http://localhost:3000`
2. Navigate to signup/login
3. Create an account
4. Try uploading a resume
5. Create a job description
6. Match candidates

## Docker Setup (Alternative)

```bash
# Build and start all services
docker-compose -f docker/docker-compose.yml up -d

# View logs
docker-compose -f docker/docker-compose.yml logs -f

# Stop services
docker-compose -f docker/docker-compose.yml down
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- MySQL: localhost:3306

## Troubleshooting

### MySQL Connection Error

If you get a connection error, verify:

```bash
# Check MySQL is running
mysql -u root -p -e "SELECT 1"

# Check credentials in .env file
cat backend/.env
```

### Port Already in Use

```bash
# Change port in .env or backend/main.py
# Port 8000 (backend) is already in use:
python main.py --port 8001

# Port 3000 (frontend) is already in use:
npm run dev -- -p 3001
```

### spaCy Model Not Found

```bash
python -m spacy download en_core_web_sm
```

### CORS Issues

Update `CORS_ORIGINS` in `backend/.env`:

```
CORS_ORIGINS=["http://localhost:3000","http://your-domain.com"]
```

## Environment Variables Reference

### Backend (.env)

```
DATABASE_URL=mysql+pymysql://root:Shiva@56@localhost:3306/resume_screening
SECRET_KEY=your-super-secret-key-min-32-chars
DEBUG=False
UPLOAD_DIR=uploads/
MAX_FILE_SIZE=5242880  # 5MB in bytes
CORS_ORIGINS=["http://localhost:3000"]
API_PREFIX=/api
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Demo Credentials

After setup, you can use these credentials:

**Email**: demo@example.com
**Password**: Demo@123

Or create your own account via signup.

## First Steps

1. **Upload a Resume**
   - Go to "Upload Resume"
   - Drag and drop a PDF or DOCX file
   - System will automatically parse it

2. **Create a Job**
   - Go to "Job Descriptions"
   - Click "Create Job"
   - Add title, description, and required skills

3. **Match Candidates**
   - Go to job details
   - Click "View Matches"
   - System will match all candidates

4. **View Analytics**
   - Check the dashboard for real-time metrics
   - View detailed analytics for insights

5. **Generate Reports**
   - Go to "Reports"
   - Generate PDF or Excel reports
   - Export candidate data

## Performance Tips

1. **Database Optimization**
   - Create indexes on frequently queried columns
   - Regular backups

2. **File Upload Optimization**
   - Keep uploads in separate storage (S3, etc.)
   - Compress old files

3. **Frontend Performance**
   - Enable production mode
   - Use CDN for static assets
   - Implement caching

## Production Deployment

### Using AWS

1. **Frontend**: Deploy to S3 + CloudFront
2. **Backend**: Use AWS App Runner or EC2
3. **Database**: Use AWS RDS MySQL

### Using Azure

1. **Frontend**: Azure Static Web Apps
2. **Backend**: Azure App Service
3. **Database**: Azure Database for MySQL

### Using Docker

```bash
docker-compose -f docker/docker-compose.yml up -d
```

## Security Checklist

- [ ] Change `SECRET_KEY` in .env
- [ ] Use strong database password
- [ ] Enable HTTPS in production
- [ ] Set `DEBUG=False` in production
- [ ] Update CORS_ORIGINS for your domain
- [ ] Implement rate limiting
- [ ] Use environment variables for secrets
- [ ] Regular security updates

## Support & Documentation

- **API Docs**: http://localhost:8000/docs
- **GitHub**: https://github.com/yourusername/resume-screening-system
- **Issues**: Open an issue on GitHub
- **Email**: support@recruitai.com

---

**Happy recruiting! 🚀**
