"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class SkillLevelEnum(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    EXPERT = "expert"


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


# ============ Base Schemas ============

class SkillBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None


class SkillCreate(SkillBase):
    pass


class SkillResponse(SkillBase):
    id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class UserSkillBase(BaseModel):
    skill_id: int
    level: SkillLevelEnum


class UserSkillCreate(UserSkillBase):
    pass


class UserSkillResponse(UserSkillBase):
    id: int
    user_id: int
    skill: Optional[SkillResponse] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None


class UserCreate(UserBase):
    pass


class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class ChatMessageBase(BaseModel):
    role: MessageRole
    content: str


class ChatMessageCreate(ChatMessageBase):
    session_id: int


class ChatMessageResponse(ChatMessageBase):
    id: int
    session_id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class SessionBase(BaseModel):
    session_id: str
    state: str = "active"


class SessionCreate(SessionBase):
    user_id: int


class SessionResponse(SessionBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class GoalBase(BaseModel):
    title: str
    description: Optional[str] = None
    target_date: Optional[datetime] = None
    completed: bool = False


class GoalCreate(GoalBase):
    session_id: int


class GoalResponse(GoalBase):
    id: int
    session_id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class FileBase(BaseModel):
    filename: str
    file_type: Optional[str] = None
    file_path: str
    file_size: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None


class FileCreate(FileBase):
    user_id: int


class FileResponse(FileBase):
    id: int
    user_id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class EvaluationBase(BaseModel):
    title: str
    description: Optional[str] = None
    evaluation_type: Optional[str] = None
    criteria: Optional[Dict[str, Any]] = None


class EvaluationCreate(EvaluationBase):
    lesson_id: int


class EvaluationResponse(EvaluationBase):
    id: int
    lesson_id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class LessonBase(BaseModel):
    title: str
    description: Optional[str] = None
    order: int
    duration_hours: Optional[int] = None
    resources: Optional[Dict[str, Any]] = None


class LessonCreate(LessonBase):
    learning_path_id: int


class LessonResponse(LessonBase):
    id: int
    learning_path_id: int
    evaluations: List[EvaluationResponse] = []
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class RequiredSkillBase(BaseModel):
    skill_id: int
    target_level: SkillLevelEnum


class RequiredSkillCreate(RequiredSkillBase):
    learning_path_id: int


class RequiredSkillResponse(RequiredSkillBase):
    id: int
    learning_path_id: int
    skill: Optional[SkillResponse] = None
    
    model_config = ConfigDict(from_attributes=True)


class LearningPathBase(BaseModel):
    title: str
    description: Optional[str] = None
    objective: Optional[str] = None
    estimated_duration_weeks: Optional[int] = None


class LearningPathCreate(LearningPathBase):
    session_id: int


class LearningPathResponse(LearningPathBase):
    id: int
    session_id: int
    lessons: List[LessonResponse] = []
    required_skills: List[RequiredSkillResponse] = []
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ============ Agent-specific Schemas ============

class AgentMemorySchema(BaseModel):
    """Memory state for the agent"""
    objective: Optional[str] = None
    relevant_experience: Optional[str] = None
    background: Optional[str] = None
    skill_level: Optional[str] = None
    constraints: Dict[str, Any] = Field(default_factory=dict)
    interests: List[str] = Field(default_factory=list)
    learning_path_created: bool = False
    scheduled_actions: List[str] = Field(default_factory=list)


class ChatRequest(BaseModel):
    """Request for chat endpoint"""
    session_id: str
    message: str
    user_id: Optional[int] = None


class ChatInitRequest(BaseModel):
    """Request to initialize a chat session"""
    session_id: str
    user_id: Optional[int] = None


class ActionData(BaseModel):
    """Data for scheduled actions"""
    type: str
    data: Dict[str, Any]


class ChatResponse(BaseModel):
    """Response from chat endpoint"""
    message: str
    session_id: str
    memory: Optional[Dict[str, Any]] = None
    actions: List[ActionData] = Field(default_factory=list)


class ErrorResponse(BaseModel):
    """Error response"""
    error: str
    detail: Optional[str] = None
