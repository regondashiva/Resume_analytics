import os
import json
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def create_resume_pdf(filename, name, title, contact, summary, experience, education, skills):
    """Programmatically generate a beautiful professional PDF resume"""
    doc = SimpleDocTemplate(filename, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    story = []
    styles = getSampleStyleSheet()

    # Define custom premium styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#1E3A8A') # Navy
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#4B5563') # Gray
    )

    contact_style = ParagraphStyle(
        'DocContact',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#6B7280'),
        spaceAfter=15
    )

    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#1E3A8A'),
        spaceBefore=12,
        spaceAfter=6,
        borderColor=colors.HexColor('#1E3A8A'),
        borderWidth=1
    )

    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#374151'),
        spaceAfter=8
    )

    bullet_style = ParagraphStyle(
        'DocBullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#374151'),
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )

    # Header
    story.append(Paragraph(name, title_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph(title, subtitle_style))
    story.append(Spacer(1, 4))
    story.append(Paragraph(contact, contact_style))
    story.append(Spacer(1, 10))

    # Summary
    story.append(Paragraph("Professional Summary", section_heading))
    story.append(Paragraph(summary, body_style))
    story.append(Spacer(1, 8))

    # Skills Table
    story.append(Paragraph("Core Technical Skills", section_heading))
    skills_data = []
    # Chunk skills into 3 columns
    cols = 3
    chunked_skills = [skills[i:i + cols] for i in range(0, len(skills), cols)]
    for chunk in chunked_skills:
        row = [Paragraph(f"• {s}", body_style) for s in chunk]
        # Pad row if incomplete
        while len(row) < cols:
            row.append(Paragraph("", body_style))
        skills_data.append(row)
        
    t = Table(skills_data, colWidths=[170, 170, 170])
    t.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t)
    story.append(Spacer(1, 8))

    # Experience
    story.append(Paragraph("Work Experience", section_heading))
    for job in experience:
        header_text = f"<b>{job['role']}</b> at <i>{job['company']}</i> ({job['years']})"
        story.append(Paragraph(header_text, body_style))
        for desc in job['desc']:
            story.append(Paragraph(f"• {desc}", bullet_style))
        story.append(Spacer(1, 6))

    # Education
    story.append(Paragraph("Education", section_heading))
    story.append(Paragraph(education, body_style))

    # Build Document
    doc.build(story)

def main():
    # Setup directories
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    datasets_dir = os.path.join(base_dir, "datasets")
    resumes_dir = os.path.join(datasets_dir, "sample_resumes")
    
    os.makedirs(resumes_dir, exist_ok=True)

    print("Generating sample candidate resumes (PDF format)...")

    # Sample Candidate 1: John Doe
    create_resume_pdf(
        os.path.join(resumes_dir, "john_doe_resume.pdf"),
        "John Doe",
        "Senior Full Stack Engineer",
        "Email: john.doe@email.com | Phone: (555) 123-4567 | Location: New York, NY",
        "Result-driven Senior Full Stack Developer with over 8 years of professional experience building highly scalable and resilient web applications. Proven track record of architecture design using Python, FastAPI, and React. Expert in Postgres performance tuning, Docker container deployments, and AWS hosting services.",
        [
            {
                "role": "Lead Software Architect",
                "company": "Enterprise Tech Corp",
                "years": "2021 - Present",
                "desc": [
                    "Led a cross-functional team of 12 engineers to design and deploy a microservices transaction platform using FastAPI, Node.js, and Docker.",
                    "Improved API response efficiency by 40% using Redis caching and PostgreSQL query optimization.",
                    "Designed scalable web UIs in React, Tailwind CSS, and Next.js, boosting customer engagement by 25%.",
                    "Architected robust CI/CD pipelines in Jenkins and Gitlab, cutting release deployment durations in half."
                ]
            },
            {
                "role": "Senior Full Stack Engineer",
                "company": "Web Solutions Inc",
                "years": "2018 - 2021",
                "desc": [
                    "Engineered back-end services using Django and Python, handling 5M+ daily requests successfully.",
                    "Built reusable responsive front-end elements in React and Redux, ensuring standard accessibility metrics.",
                    "Migrated local development infrastructure to AWS (ECS, RDS, S3), reducing monthly hosting expenditures by 15%."
                ]
            }
        ],
        "Master of Science in Computer Science - Columbia University (Graduated 2018)<br/>Bachelor of Science in Software Engineering - NYU (Graduated 2016)",
        ["Python", "React", "FastAPI", "Django", "PostgreSQL", "Docker", "AWS", "CI/CD", "JavaScript", "TypeScript", "Redis", "Git"]
    )

    # Sample Candidate 2: Jane Smith
    create_resume_pdf(
        os.path.join(resumes_dir, "jane_smith_resume.pdf"),
        "Jane Smith",
        "DevOps & Cloud Solutions Architect",
        "Email: jane.smith@email.com | Phone: (555) 987-6543 | Location: San Francisco, CA",
        "Distinguished Cloud Systems Architect and DevOps Specialist with 12+ years of hands-on experience designing cloud infrastructure and deployment automations. Expertise in container orchestration (Kubernetes), infrastructure as code (Terraform), and cloud deployments (AWS, GCP). Highly proficient in scripting with Python and Bash.",
        [
            {
                "role": "Principal DevOps Engineer",
                "company": "Global Cloud Systems",
                "years": "2020 - Present",
                "desc": [
                    "Architected and deployed multi-region Kubernetes clusters (EKS) hosting 150+ microservices securely.",
                    "Created infrastructure deployment automations in Terraform, reducing resource provisioning time from days to minutes.",
                    "Established strict DevSecOps protocols incorporating container vulnerability scans, ensuring HIPAA compliance.",
                    "Optimized cloud infrastructure spending, saving the organization $300,000 annually in AWS computing charges."
                ]
            },
            {
                "role": "Senior Cloud Infrastructure Engineer",
                "company": "Platform Innovators",
                "years": "2015 - 2020",
                "desc": [
                    "Managed AWS and GCP cloud architectures featuring high availability, autoscaling, and secure VPC tunnels.",
                    "Built comprehensive centralized logging and monitor metrics systems using Prometheus, Grafana, and ELK Stack.",
                    "Created modular python scripting suites to automate system backup routines and automated disaster recovery tests."
                ]
            }
        ],
        "Bachelor of Science in Computer Engineering - UC Berkeley (Graduated 2014)",
        ["AWS", "Kubernetes", "Docker", "Terraform", "CI/CD", "Python", "GCP", "Prometheus", "Grafana", "Linux", "Bash", "Jenkins"]
    )

    # Sample Candidate 3: Bob Johnson
    create_resume_pdf(
        os.path.join(resumes_dir, "bob_johnson_resume.pdf"),
        "Bob Johnson",
        "Junior Frontend Developer",
        "Email: bob.johnson@email.com | Phone: (555) 456-7890 | Location: Austin, TX",
        "Enthusiastic and self-motivated Frontend Web Developer with 1.5 years of experience building beautiful, accessible user interfaces. Specialized in React.js, modern JavaScript (ES6+), and responsive CSS styling using Tailwind CSS. Dedicated to clean coding principles and crafting optimized digital experiences.",
        [
            {
                "role": "Junior UI Developer",
                "company": "Pixel Perfect Studio",
                "years": "2024 - Present",
                "desc": [
                    "Developed fully responsive customer landing pages in React and Tailwind CSS, reducing browser layout shift by 30%.",
                    "Integrated backend REST APIs using Axios and Zustand, enabling real-time client side data rendering.",
                    "Participated in agile scrum meetings, contributing actively to user story designs and code reviews.",
                    "Resolved cross-browser layout compatibility anomalies, improving mobile viewport rendering metrics."
                ]
            }
        ],
        "Bachelor of Arts in Web Design & Interactive Media - University of Texas (Graduated 2023)",
        ["React", "JavaScript", "Tailwind CSS", "HTML5", "CSS3", "Git", "Zustand", "REST APIs", "Figma", "Sass", "Responsive Design"]
    )

    print("Sample resumes generated inside: datasets/sample_resumes/")

    # Generate sample jobs JSON
    print("Generating sample job descriptions (JSON format)...")
    sample_jobs = [
        {
            "title": "Senior Full-Stack Developer",
            "description": "We are seeking an experienced Senior Full-Stack Developer to lead the architecture of our core web platform. You will be responsible for designing secure back-end APIs in Python/FastAPI, writing scalable client-side interfaces in React.js, and deploying dockerized containers on AWS. Passion for performance, code coverage, and mentoring junior engineers is a must.",
            "required_skills": ["Python", "React", "FastAPI", "PostgreSQL", "Docker", "AWS", "TypeScript"],
            "experience_required": 5.0,
            "qualifications": "Bachelor's or Master's degree in Computer Science or equivalent technical field."
        },
        {
            "title": "Cloud DevOps & Platform Architect",
            "description": "Looking for a seasoned DevOps Architect to deploy and scale containerized clusters. The ideal candidate will have deep expertise in Kubernetes, orchestrating deployments using Terraform and Helm, and creating standard DevSecOps delivery pipelines in AWS or GCP environments. Strong scripting skills in Python or Go are highly desirable.",
            "required_skills": ["AWS", "Kubernetes", "Docker", "Terraform", "CI/CD", "Python", "Linux"],
            "experience_required": 8.0,
            "qualifications": "Degree in Computer Engineering or proven industry experience in systems engineering."
        }
    ]

    with open(os.path.join(datasets_dir, "sample_jobs.json"), "w") as f:
        json.dump(sample_jobs, f, indent=4)
        
    print("Sample jobs generated as: datasets/sample_jobs.json")
    print("Sample dataset preparation concluded successfully!")

if __name__ == "__main__":
    main()
