"""
FastAPI wrapper for local development
Provides REST API compatible with the Vercel serverless function
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os

from openrouter import OpenRouter
from api.chat import LearningPathAgent
from api.db import init_db
from api.schemas import ChatRequest, ChatResponse, ErrorResponse

# Initialize FastAPI app
app = FastAPI(
    title="Teleric Learning Path API",
    description="AI-powered personalized learning path generator",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    try:
        init_db()
        print("✅ Database initialized")
    except Exception as e:
        print(f"⚠️  Database initialization warning: {e}")


# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "teleric-api",
        "database": "connected"
    }


# Initialize chat session
@app.post("/api/chat/init")
async def init_chat(session_id: str, user_id: Optional[int] = None):
    """Initialize a new chat session"""
    try:
        api_key = os.environ.get('OPENROUTER_API_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY not configured")
        
        model = os.environ.get('OPENAI_MODEL', 'openai/gpt-4o-mini')
        
        with OpenRouter(api_key=api_key) as client:
            agent = LearningPathAgent(
                client=client,
                model=model,
                session_id=session_id
            )
            
            initial_message = agent.chat_messages[-1]['content'] if agent.chat_messages else \
                "Hi! I'm here to help you create a personalized learning path."
            
            return {
                "message": initial_message,
                "session_id": session_id
            }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error initializing chat: {str(e)}")


# Chat endpoint
@app.post("/api/chat")
async def chat(request: ChatRequest):
    """Process chat message"""
    try:
        if not request.message:
            raise HTTPException(status_code=400, detail="message is required")
        
        api_key = os.environ.get('OPENROUTER_API_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY not configured")
        
        model = os.environ.get('OPENAI_MODEL', 'openai/gpt-4o-mini')
        
        with OpenRouter(api_key=api_key) as client:
            agent = LearningPathAgent(
                client=client,
                model=model,
                session_id=request.session_id
            )
            
            response = agent.respond(request.message)
            pending_actions = agent.get_pending_actions()
            
            return {
                "message": response,
                "session_id": request.session_id,
                "memory": {
                    "objective": agent.memory.objective,
                    "relevant_experience": agent.memory.relevant_experience,
                    "learning_path_created": agent.memory.learning_path_created
                },
                "actions": pending_actions
            }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")


# Get session info
@app.get("/api/session/{session_id}")
async def get_session(session_id: str):
    """Get session information"""
    from api.db import load_conversation
    
    try:
        conversation = load_conversation(session_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return {
            "session_id": session_id,
            "state": conversation.get('state'),
            "memory": conversation.get('memory'),
            "message_count": len(conversation.get('chat_history', []))
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving session: {str(e)}")


# Get learning paths
@app.get("/api/learning-paths/{session_id}")
async def get_learning_paths(session_id: str):
    """Get all learning paths for a session"""
    from api.db import get_learning_paths
    
    try:
        paths = get_learning_paths(session_id)
        return {
            "session_id": session_id,
            "learning_paths": paths
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving learning paths: {str(e)}")


# Database stats
@app.get("/api/stats")
async def get_stats():
    """Get database statistics"""
    from api.db import get_db
    from api.models import User, Session as SessionModel, LearningPath
    
    try:
        with get_db() as db:
            user_count = db.query(User).count()
            session_count = db.query(SessionModel).count()
            path_count = db.query(LearningPath).count()
            
            return {
                "users": user_count,
                "sessions": session_count,
                "learning_paths": path_count
            }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving stats: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000, reload=True)
