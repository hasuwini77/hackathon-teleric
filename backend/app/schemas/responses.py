import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    email: str
    name: str
    role: str | None = None
    location: str | None = None
    linkedin_url: str | None = None
    cv_file_path: str | None = None
    avatar_url: str | None = None
    experience_summary: str | None = None
    learning_style: str | None = None
    preferences: dict | None = None
    created_at: datetime
    updated_at: datetime


class SkillResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    name: str
    category: str | None = None
    description: str | None = None
    created_at: datetime


class UserSkillResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: uuid.UUID
    skill_id: uuid.UUID
    level: str
    source: str | None = None
    skill: SkillResponse | None = None
    created_at: datetime
    updated_at: datetime


class ContentTagResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    tag: str
    created_at: datetime


class ContentSkillResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    content_id: uuid.UUID
    skill_id: uuid.UUID
    skill: SkillResponse | None = None


class ContentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
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
    language: str
    author: str | None = None
    thumbnail_url: str | None = None
    uploaded_by: uuid.UUID | None = None
    verification_status: str
    license_info: str | None = None
    tags: list[ContentTagResponse] = []
    skills: list[ContentSkillResponse] = []
    created_at: datetime
    updated_at: datetime


class ContentSearchResult(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    title: str
    description: str
    content_type: str
    source_type: str
    difficulty: str | None = None
    url: str | None = None
    score: float | None = None


class WorkspaceSkillResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    workspace_id: uuid.UUID
    skill_id: uuid.UUID
    status: str
    level_at_start: str | None = None
    level_current: str | None = None
    source: str | None = None
    skill: SkillResponse | None = None
    created_at: datetime
    updated_at: datetime


class WorkspaceContentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    workspace_id: uuid.UUID
    content_id: uuid.UUID
    added_by: str
    status: str
    order: int | None = None
    completed_at: datetime | None = None
    created_at: datetime


class WorkspaceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    description: str | None = None
    objective: str | None = None
    status: str
    created_at: datetime
    updated_at: datetime


class WorkspaceDetailResponse(WorkspaceResponse):
    skills: list[WorkspaceSkillResponse] = []
    content_links: list[WorkspaceContentResponse] = []
    sessions: list["ChatSessionResponse"] = []
    learning_paths: list["LearningPathResponse"] = []


class LearningPathStepResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    learning_path_id: uuid.UUID
    content_id: uuid.UUID | None = None
    step_number: int
    title: str
    description: str | None = None
    step_type: str
    status: str
    duration: str | None = None
    url: str | None = None
    created_at: datetime
    updated_at: datetime


class LearningPathResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: uuid.UUID
    workspace_id: uuid.UUID | None = None
    title: str
    description: str | None = None
    objective: str | None = None
    difficulty: str | None = None
    estimated_duration: str | None = None
    time_per_week: str | None = None
    deadline: str | None = None
    status: str
    total_steps: int
    completed_steps: int
    progress_percent: float
    generated_by: str
    raw_agent_output: str | None = None
    chat_session_id: uuid.UUID | None = None
    created_at: datetime
    updated_at: datetime


class LearningPathDetailResponse(LearningPathResponse):
    steps: list[LearningPathStepResponse] = []


class ChatMessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    session_id: uuid.UUID
    role: str
    content: str
    message_index: int
    extracted_data: dict | None = None
    action_triggered: str | None = None
    created_at: datetime


class ChatSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: uuid.UUID
    workspace_id: uuid.UUID | None = None
    title: str | None = None
    objective: str | None = None
    relevant_experience: str | None = None
    background: str | None = None
    relevant_skills: list | None = None
    required_skills: list | None = None
    interests: list | None = None
    time_per_week: str | None = None
    deadline: str | None = None
    learning_path_created: bool
    status: str
    learning_path_id: uuid.UUID | None = None
    created_at: datetime
    updated_at: datetime


class ChatSessionDetailResponse(ChatSessionResponse):
    messages: list[ChatMessageResponse] = []


class UserProgressResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    user_id: uuid.UUID
    learning_path_id: uuid.UUID | None = None
    step_id: uuid.UUID | None = None
    content_id: uuid.UUID | None = None
    status: str
    completed_at: datetime | None = None
    time_spent_minutes: int
    notes: str | None = None
    rating: int | None = None
    created_at: datetime
    updated_at: datetime


class ContentReviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: uuid.UUID
    content_id: uuid.UUID
    reviewer_type: str
    status: str
    is_accessible: bool | None = None
    is_content_fresh: bool | None = None
    license_compliant: bool | None = None
    quality_score: float | None = None
    notes: str | None = None
    reviewed_at: datetime | None = None
    next_review_at: datetime | None = None
    created_at: datetime


# Resolve forward refs
WorkspaceDetailResponse.model_rebuild()
