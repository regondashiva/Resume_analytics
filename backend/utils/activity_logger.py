from sqlalchemy.orm import Session
from typing import Optional
from models.models import ActivityLog

def log_activity(db: Session, user_id: Optional[int], user_name: Optional[str], action: str, details: Optional[str] = None):
    """
    Log a user or system activity in the database.
    """
    try:
        log = ActivityLog(
            user_id=user_id,
            user_name=user_name or "System",
            action=action,
            details=details
        )
        db.add(log)
        db.commit()
    except Exception as e:
        print(f"[ActivityLogger Error] {e}")
