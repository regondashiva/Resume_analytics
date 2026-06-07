from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from config import settings
import logging

logger = logging.getLogger("database")

# Set up engine with automatic fallback
db_url = settings.DATABASE_URL
engine = None

try:
    if "sqlite" in db_url:
        engine = create_engine(db_url, connect_args={"check_same_thread": False})
    else:
        engine = create_engine(
            db_url,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20,
        )
    # Test connection
    with engine.connect() as conn:
        pass
except Exception as e:
    logger.warning(f"Failed to connect to database URL: {db_url}. Falling back to local SQLite. Error: {e}")
    db_url = "sqlite:///./resume_screening.db"
    engine = create_engine(db_url, connect_args={"check_same_thread": False})

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_all_tables():
    """Create all database tables and seed default user"""
    try:
        from sqlalchemy import inspect, text
        Base.metadata.create_all(bind=engine)
        
        # Auto-migration: check and add missing columns on MySQL
        try:
            inspector = inspect(engine)
            
            # 1. Candidates table self-healing
            if 'candidates' in inspector.get_table_names():
                columns = [c['name'] for c in inspector.get_columns('candidates')]
                with engine.begin() as conn:
                    candidate_cols = {
                        'skills': "ALTER TABLE candidates ADD COLUMN skills JSON",
                        'experience_years': "ALTER TABLE candidates ADD COLUMN experience_years FLOAT DEFAULT 0",
                        'education': "ALTER TABLE candidates ADD COLUMN education TEXT",
                        'experience_details': "ALTER TABLE candidates ADD COLUMN experience_details TEXT",
                        'resume_path': "ALTER TABLE candidates ADD COLUMN resume_path VARCHAR(500)",
                        'parsed_content': "ALTER TABLE candidates ADD COLUMN parsed_content TEXT",
                        'score': "ALTER TABLE candidates ADD COLUMN score FLOAT DEFAULT 0",
                        'created_by': "ALTER TABLE candidates ADD COLUMN created_by INT",
                        'created_at': "ALTER TABLE candidates ADD COLUMN created_at DATETIME",
                        'updated_at': "ALTER TABLE candidates ADD COLUMN updated_at DATETIME",
                        'skills_json': "ALTER TABLE candidates ADD COLUMN skills_json TEXT",
                        'education_text': "ALTER TABLE candidates ADD COLUMN education_text TEXT",
                        'experience_text': "ALTER TABLE candidates ADD COLUMN experience_text TEXT",
                        'resume_score': "ALTER TABLE candidates ADD COLUMN resume_score FLOAT DEFAULT 0",
                        'matched_skills_json': "ALTER TABLE candidates ADD COLUMN matched_skills_json TEXT",
                        'missing_skills_json': "ALTER TABLE candidates ADD COLUMN missing_skills_json TEXT",
                        'file_path': "ALTER TABLE candidates ADD COLUMN file_path VARCHAR(1024)",
                        'raw_text_excerpt': "ALTER TABLE candidates ADD COLUMN raw_text_excerpt TEXT",
                        'upload_time': "ALTER TABLE candidates ADD COLUMN upload_time DATETIME"
                    }
                    for col, stmt in candidate_cols.items():
                        if col not in columns:
                            logger.info(f"Migrating candidates table: adding '{col}' column.")
                            conn.execute(text(stmt))
                            
            # 2. Jobs table self-healing
            if 'jobs' in inspector.get_table_names():
                job_columns = [c['name'] for c in inspector.get_columns('jobs')]
                with engine.begin() as conn:
                    job_cols = {
                        'required_skills': "ALTER TABLE jobs ADD COLUMN required_skills JSON",
                        'experience_required': "ALTER TABLE jobs ADD COLUMN experience_required FLOAT DEFAULT 0",
                        'qualifications': "ALTER TABLE jobs ADD COLUMN qualifications TEXT",
                        'department': "ALTER TABLE jobs ADD COLUMN department VARCHAR(100) DEFAULT 'Engineering'",
                        'is_active': "ALTER TABLE jobs ADD COLUMN is_active BOOLEAN DEFAULT TRUE",
                        'created_at': "ALTER TABLE jobs ADD COLUMN created_at DATETIME",
                        'updated_at': "ALTER TABLE jobs ADD COLUMN updated_at DATETIME"
                    }
                    for col, stmt in job_cols.items():
                        if col not in job_columns:
                            logger.info(f"Migrating jobs table: adding '{col}' column.")
                            conn.execute(text(stmt))
                            
            # 3. Matching Results table self-healing
            if 'matching_results' in inspector.get_table_names():
                match_columns = [c['name'] for c in inspector.get_columns('matching_results')]
                with engine.begin() as conn:
                    match_cols = {
                        'match_score': "ALTER TABLE matching_results ADD COLUMN match_score FLOAT DEFAULT 0",
                        'matched_skills': "ALTER TABLE matching_results ADD COLUMN matched_skills JSON",
                        'missing_skills': "ALTER TABLE matching_results ADD COLUMN missing_skills JSON",
                        'experience_match': "ALTER TABLE matching_results ADD COLUMN experience_match FLOAT DEFAULT 0",
                        'overall_rank': "ALTER TABLE matching_results ADD COLUMN overall_rank INT",
                        'recommendation': "ALTER TABLE matching_results ADD COLUMN recommendation VARCHAR(50)",
                        'created_at': "ALTER TABLE matching_results ADD COLUMN created_at DATETIME",
                        'updated_at': "ALTER TABLE matching_results ADD COLUMN updated_at DATETIME"
                    }
                    for col, stmt in match_cols.items():
                        if col not in match_columns:
                            logger.info(f"Migrating matching_results table: adding '{col}' column.")
                            conn.execute(text(stmt))
        except Exception as migrate_err:
            logger.warning(f"Auto-migration warning: {migrate_err}")
            
        # Seed default recruiter account if none exists
        from models.models import User
        from authentication.jwt_handler import hash_password
        db = SessionLocal()
        try:
            if db.query(User).count() == 0:
                default_user = User(
                    name="RecruitAI Recruiter",
                    email="recruiter@recruitai.com",
                    password_hash=hash_password("password123"),
                    role="hr"
                )
                db.add(default_user)
                db.commit()
                logger.info("Default recruiter user seeded: recruiter@recruitai.com / password123")
        except Exception as seed_err:
            logger.error(f"Failed to seed default recruiter: {seed_err}")
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Error creating tables: {e}")

