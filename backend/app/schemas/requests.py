import uuid
from datetime import datetime

from pydantic import BaseModel


# --- Users ---
class UserCreate(BaseModel):
    email: str
    name: str
    role: str | None = None
    location: str | None = None
    linkedin_url: str | None = None
    avatar_url: str | None = None
    experience_summary: str | None = None
    learning_style: str | None = None
    preferences: dict | None = None


class UserUpdate(BaseModel):
    name: str | None = None
    role: str | None = None
    location: str | None = None
    linkedin_url: str | None = None
    avatar_url: str | None = None
    experience_summary: str | None = None
    learning_style: str | None = None
    preferences: dict | None = None


class UserSkillAdd(BaseModel):
    skill_id: uuid.UUID
    level: str = "beginner"
    source: str | None = "self_reported"


# --- Skills ---
class SkillCreate(BaseModel):
    name: str
    category: str | None = None
    description: str | None = None


# --- Content ---
class ContentCreate(BaseModel):
    title: str
    description: str
    content_type: str
    source_type: str
    url: str | None = None
    provider: str | None = None
    file_path: str | None = None
    internal_url: str | None = None
    duration: str | None = None
    difficulty: str | None = None
    language: str = "en"
    author: str | None = None
    thumbnail_url: str | None = None
    uploaded_by: uuid.UUID | None = None
    license_info: str | None = None
    skill_ids: list[uuid.UUID] | None = None
    tags: list[str] | None = None


class ContentUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    content_type: str | None = None
    source_type: str | None = None
    url: str | None = None
    provider: str | None = None
    file_path: str | None = None
    internal_url: str | None = None
    duration: str | None = None
    difficulty: str | None = None
    language: str | None = None
    author: str | None = None
    thumbnail_url: str | None = None
    license_info: str | None = None


class TagAdd(BaseModel):
    tag: str


# --- Workspaces ---
class WorkspaceCreate(BaseModel):
    user_id: uuid.UUID
    name: str
    description: str | None = None
    objective: str | None = None


class WorkspaceUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    objective: str | None = None
    status: str | None = None


class WorkspaceSkillAdd(BaseModel):
    skill_id: uuid.UUID
    status: str = "target"
    level_at_start: str | None = None
    source: str | None = "user_added"


class WorkspaceSkillUpdate(BaseModel):
    status: str | None = None
    level_current: str | None = None


class WorkspaceContentAdd(BaseModel):
    content_id: uuid.UUID
    added_by: str = "user"
    order: int | None = None


# --- Learning Paths ---
class LearningPathCreate(BaseModel):
    user_id: uuid.UUID
    workspace_id: uuid.UUID | None = None
    title: str
    description: str | None = None
    objective: str | None = None
    difficulty: str | None = None
    estimated_duration: str | None = None
    time_per_week: str | None = None
    deadline: str | None = None
    generated_by: str = "agent"
    raw_agent_output: str | None = None
    chat_session_id: uuid.UUID | None = None


class LearningPathUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    objective: str | None = None
    difficulty: str | None = None
    estimated_duration: str | None = None
    time_per_week: str | None = None
    deadline: str | None = None
    status: str | None = None


class LearningPathStepCreate(BaseModel):
    content_id: uuid.UUID | None = None
    step_number: int
    title: str
    description: str | None = None
    step_type: str = "resource"
    status: str = "locked"
    duration: str | None = None
    url: str | None = None


class LearningPathStepUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    step_type: str | None = None
    status: str | None = None
    duration: str | None = None
    url: str | None = None


# --- Chat ---
class ChatSessionCreate(BaseModel):
    user_id: uuid.UUID
    workspace_id: uuid.UUID | None = None
    title: str | None = None
    objective: str | None = None


class ChatSessionUpdate(BaseModel):
    title: str | None = None
    objective: str | None = None
    relevant_experience: str | None = None
    background: str | None = None
    relevant_skills: list | None = None
    required_skills: list | None = None
    interests: list | None = None
    time_per_week: str | None = None
    deadline: str | None = None
    learning_path_created: bool | None = None
    status: str | None = None
    learning_path_id: uuid.UUID | None = None
    workspace_id: uuid.UUID | None = None


class ChatMessageCreate(BaseModel):
    role: str
    content: str


class ChatRespondRequest(BaseModel):
    content: str


# --- Progress ---
class ProgressCreate(BaseModel):
    user_id: uuid.UUID
    learning_path_id: uuid.UUID | None = None
    step_id: uuid.UUID | None = None
    content_id: uuid.UUID | None = None
    status: str = "not_started"


class ProgressUpdate(BaseModel):
    status: str | None = None
    completed_at: datetime | None = None
    time_spent_minutes: int | None = None
    notes: str | None = None
    rating: int | None = None
