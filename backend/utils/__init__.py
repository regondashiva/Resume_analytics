"""Utils package"""

import os
import shutil
from pathlib import Path

def create_directories(base_path: str = "."):
    """Create necessary directories"""
    dirs = [
        os.path.join(base_path, "uploads"),
        os.path.join(base_path, "reports"),
        os.path.join(base_path, "logs"),
    ]

    for dir_path in dirs:
        Path(dir_path).mkdir(parents=True, exist_ok=True)

def delete_file(file_path: str) -> bool:
    """Delete a file safely"""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
    except Exception as e:
        print(f"Error deleting file: {e}")
    return False

def get_file_extension(filename: str) -> str:
    """Get file extension"""
    return filename.split('.')[-1].lower() if '.' in filename else ""
