from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# Import all models so Alembic can discover them
from database.models.user import User  # noqa: E402, F401
from database.models.skill import Skill  # noqa: E402, F401
from database.models.user_skill import UserSkill  # noqa: E402, F401
from database.models.workspace import Workspace  # noqa: E402, F401
from database.models.workspace_skill import WorkspaceSkill  # noqa: E402, F401
from database.models.workspace_content import WorkspaceContent  # noqa: E402, F401
from database.models.content import Content  # noqa: E402, F401
from database.models.content_skill import ContentSkill  # noqa: E402, F401
from database.models.content_tag import ContentTag  # noqa: E402, F401
from database.models.learning_path import LearningPath  # noqa: E402, F401
from database.models.learning_path_step import LearningPathStep  # noqa: E402, F401
from database.models.user_progress import UserProgress  # noqa: E402, F401
from database.models.chat_session import ChatSession  # noqa: E402, F401
from database.models.chat_message import ChatMessage  # noqa: E402, F401
from database.models.content_review import ContentReview  # noqa: E402, F401
