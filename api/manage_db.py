#!/usr/bin/env python3
"""
Database management CLI utility
"""
import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from api.db import init_db, get_db
from api.models import User, Skill, Session as SessionModel
from api.schemas import SkillCreate


def seed_skills():
    """Seed common skills into the database"""
    common_skills = [
        {"name": "Python", "category": "Programming", "description": "Python programming language"},
        {"name": "JavaScript", "category": "Programming", "description": "JavaScript programming language"},
        {"name": "React", "category": "Framework", "description": "React frontend framework"},
        {"name": "SQL", "category": "Database", "description": "SQL database querying"},
        {"name": "Git", "category": "Tools", "description": "Version control with Git"},
        {"name": "Machine Learning", "category": "AI/ML", "description": "Machine learning fundamentals"},
        {"name": "Docker", "category": "DevOps", "description": "Container orchestration with Docker"},
        {"name": "AWS", "category": "Cloud", "description": "Amazon Web Services"},
        {"name": "TypeScript", "category": "Programming", "description": "TypeScript language"},
        {"name": "Node.js", "category": "Runtime", "description": "Node.js runtime environment"},
    ]
    
    with get_db() as db:
        for skill_data in common_skills:
            # Check if skill already exists
            existing = db.query(Skill).filter(Skill.name == skill_data["name"]).first()
            if not existing:
                skill = Skill(**skill_data)
                db.add(skill)
                print(f"Added skill: {skill_data['name']}")
            else:
                print(f"Skill already exists: {skill_data['name']}")


def stats():
    """Print database statistics"""
    with get_db() as db:
        user_count = db.query(User).count()
        session_count = db.query(SessionModel).count()
        skill_count = db.query(Skill).count()
        
        print(f"\n📊 Database Statistics:")
        print(f"  Users: {user_count}")
        print(f"  Sessions: {session_count}")
        print(f"  Skills: {skill_count}")


def reset_db():
    """Reset database (WARNING: Deletes all data)"""
    response = input("⚠️  This will DELETE ALL DATA. Are you sure? (yes/no): ")
    if response.lower() == 'yes':
        from api.models import Base
        from api.db import engine
        
        print("Dropping all tables...")
        Base.metadata.drop_all(bind=engine)
        
        print("Creating tables...")
        init_db()
        
        print("✅ Database reset complete")
    else:
        print("❌ Reset cancelled")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python manage_db.py init       - Initialize database")
        print("  python manage_db.py seed       - Seed common skills")
        print("  python manage_db.py stats      - Show database statistics")
        print("  python manage_db.py reset      - Reset database (WARNING)")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "init":
        print("Initializing database...")
        init_db()
        print("✅ Database initialized")
    
    elif command == "seed":
        print("Seeding skills...")
        seed_skills()
        print("✅ Skills seeded")
    
    elif command == "stats":
        stats()
    
    elif command == "reset":
        reset_db()
    
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)
