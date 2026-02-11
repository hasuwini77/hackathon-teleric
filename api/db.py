"""
Database utilities using SQLAlchemy for Neon PostgreSQL
Handles conversation state persistence with proper ORM
"""
import os
import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Optional, Dict, Any, List
from contextlib import contextmanager

try:
    from .models import Base, User, Session as SessionModel, ChatMessage, LearningPath, Skill, Goal
    from .schemas import AgentMemorySchema
except ImportError:
    from models import Base, User, SessionModel, ChatMessage, LearningPath, Skill, Goal
    from schemas import AgentMemorySchema


# Database engine and session factory
engine = create_engine(
    os.environ.get('DATABASE_URL', ''),
    pool_pre_ping=True,
    pool_recycle=300,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@contextmanager
def get_db():
    """Context manager for database sessions"""
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def init_db():
    """Initialize database schema
    
    Note: In production, use Alembic migrations instead.
    This is primarily for local development and testing.
    """
    Base.metadata.create_all(bind=engine)


def get_or_create_user(db: Session, email: str, name: Optional[str] = None) -> User:
    """Get existing user or create new one"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(email=email, name=name)
        db.add(user)
        db.flush()
    return user


def get_or_create_session(
    db: Session, 
    session_id: str, 
    user_id: Optional[int] = None
) -> SessionModel:
    """Get existing session or create new one"""
    session = db.query(SessionModel).filter(SessionModel.session_id == session_id).first()
    if not session:
        # Create anonymous user if no user_id provided
        if not user_id:
            user = get_or_create_user(db, f"anon_{session_id}@temp.com", "Anonymous")
            user_id = user.id
        
        session = SessionModel(session_id=session_id, user_id=user_id, state="active")
        db.add(session)
        db.flush()
    return session


def save_conversation(
    session_id: str, 
    state: str, 
    memory: Dict[str, Any], 
    chat_messages: List[Dict[str, str]]
):
    """Save or update conversation state"""
    with get_db() as db:
        session = get_or_create_session(db, session_id)
        
        # Update session state
        session.state = state
        
        # Clear old messages and add new ones
        db.query(ChatMessage).filter(ChatMessage.session_id == session.id).delete()
        
        for msg in chat_messages:
            if msg.get('role') in ['user', 'assistant', 'system']:
                chat_msg = ChatMessage(
                    session_id=session.id,
                    role=msg['role'],
                    content=msg['content']
                )
                db.add(chat_msg)
        
        db.flush()


def load_conversation(session_id: str) -> Optional[Dict[str, Any]]:
    """Load conversation state from database"""
    with get_db() as db:
        session = db.query(SessionModel).filter(SessionModel.session_id == session_id).first()
        
        if not session:
            return None
        
        # Load chat messages
        messages = db.query(ChatMessage).filter(
            ChatMessage.session_id == session.id
        ).order_by(ChatMessage.created_at).all()
        
        chat_history = [
            {"role": msg.role, "content": msg.content}
            for msg in messages
        ]
        
        # For now, return a structure compatible with the old format
        # Memory will be reconstructed from chat history by the agent
        return {
            'state': session.state,
            'memory': {},  # Agent will extract from chat history
            'chat_history': chat_history
        }


def save_learning_path(
    session_id: str,
    title: str,
    description: Optional[str] = None,
    objective: Optional[str] = None,
    lessons: Optional[List[Dict[str, Any]]] = None
) -> int:
    """Save a learning path to the database"""
    with get_db() as db:
        session = get_or_create_session(db, session_id)
        
        learning_path = LearningPath(
            session_id=session.id,
            title=title,
            description=description,
            objective=objective
        )
        db.add(learning_path)
        db.flush()
        
        # Add lessons if provided
        if lessons:
            from models import Lesson
            for idx, lesson_data in enumerate(lessons):
                lesson = Lesson(
                    learning_path_id=learning_path.id,
                    title=lesson_data.get('title', f'Lesson {idx + 1}'),
                    description=lesson_data.get('description'),
                    order=idx + 1,
                    duration_hours=lesson_data.get('duration_hours'),
                    resources=lesson_data.get('resources')
                )
                db.add(lesson)
        
        db.flush()
        return learning_path.id


def get_learning_paths(session_id: str) -> List[Dict[str, Any]]:
    """Get all learning paths for a session"""
    with get_db() as db:
        session = db.query(SessionModel).filter(SessionModel.session_id == session_id).first()
        
        if not session:
            return []
        
        paths = db.query(LearningPath).filter(
            LearningPath.session_id == session.id
        ).all()
        
        return [
            {
                'id': path.id,
                'title': path.title,
                'description': path.description,
                'objective': path.objective,
                'created_at': path.created_at.isoformat()
            }
            for path in paths
        ]
