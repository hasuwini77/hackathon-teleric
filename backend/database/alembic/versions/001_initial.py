"""Initial schema with all tables and pgvector

Revision ID: 001
Revises:
Create Date: 2026-02-16

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Enable pgvector extension
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    # 1. users
    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("email", sa.String(), nullable=False, unique=True, index=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("role", sa.String(), nullable=True),
        sa.Column("location", sa.String(), nullable=True),
        sa.Column("linkedin_url", sa.String(), nullable=True),
        sa.Column("cv_file_path", sa.String(), nullable=True),
        sa.Column("avatar_url", sa.String(), nullable=True),
        sa.Column("experience_summary", sa.String(), nullable=True),
        sa.Column("learning_style", sa.String(), nullable=True),
        sa.Column("preferences", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )

    # 2. skills
    op.create_table(
        "skills",
        sa.Column("id", sa.Uuid(), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("name", sa.String(), nullable=False, unique=True, index=True),
        sa.Column("category", sa.String(), nullable=True),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("embedding", Vector(384), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )

    # 3. user_skills
    op.create_table(
        "user_skills",
        sa.Column("id", sa.Uuid(), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("skill_id", sa.Uuid(), sa.ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("level", sa.String(), nullable=False, server_default="beginner"),
        sa.Column("source", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("user_id", "skill_id", name="uq_user_skill"),
    )

    # 4. workspaces
    op.create_table(
        "workspaces",
        sa.Column("id", sa.Uuid(), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("objective", sa.String(), nullable=True),
        sa.Column("objective_embedding", Vector(384), nullable=True),
        sa.Column("status", sa.String(), nullable=False, server_default="active"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )

    # 5. workspace_skills
    op.create_table(
        "workspace_skills",
        sa.Column("id", sa.Uuid(), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("workspace_id", sa.Uuid(), sa.ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("skill_id", sa.Uuid(), sa.ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("status", sa.String(), nullable=False, server_default="target"),
        sa.Column("level_at_start", sa.String(), nullable=True),
        sa.Column("level_current", sa.String(), nullable=True),
        sa.Column("source", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("workspace_id", "skill_id", name="uq_workspace_skill"),
    )

    # 6. content
    op.create_table(
        "content",
        sa.Column("id", sa.Uuid(), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("title", sa.String(), nullable=False, index=True),
        sa.Column("description", sa.String(), nullable=False),
        sa.Column("embedding", Vector(384), nullable=True),
        sa.Column("content_type", sa.String(), nullable=False),
        sa.Column("source_type", sa.String(), nullable=False),
        sa.Column("url", sa.String(), nullable=True),
        sa.Column("provider", sa.String(), nullable=True),
        sa.Column("file_path", sa.String(), nullable=True),
        sa.Column("internal_url", sa.String(), nullable=True),
        sa.Column("duration", sa.String(), nullable=True),
        sa.Column("difficulty", sa.String(), nullable=True),
        sa.Column("language", sa.String(), nullable=False, server_default="en"),
        sa.Column("author", sa.String(), nullable=True),
        sa.Column("thumbnail_url", sa.String(), nullable=True),
        sa.Column("uploaded_by", sa.Uuid(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("content_created_at", sa.DateTime(), nullable=True),
        sa.Column("latest_verified_at", sa.DateTime(), nullable=True),
        sa.Column("verification_status", sa.String(), nullable=False, server_default="unverified"),
        sa.Column("license_info", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )

    # 7. workspace_content
    op.create_table(
        "workspace_content",
        sa.Column("id", sa.Uuid(), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("workspace_id", sa.Uuid(), sa.ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("content_id", sa.Uuid(), sa.ForeignKey("content.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("added_by", sa.String(), nullable=False, server_default="agent"),
        sa.Column("status", sa.String(), nullable=False, server_default="pending"),
        sa.Column("order", sa.Integer(), nullable=True),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )

    # 8. content_skills
    op.create_table(
        "content_skills",
        sa.Column("id", sa.Uuid(), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("content_id", sa.Uuid(), sa.ForeignKey("content.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("skill_id", sa.Uuid(), sa.ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.UniqueConstraint("content_id", "skill_id", name="uq_content_skill"),
    )

    # 9. content_tags
    op.create_table(
        "content_tags",
        sa.Column("id", sa.Uuid(), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("content_id", sa.Uuid(), sa.ForeignKey("content.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("tag", sa.String(), nullable=False, index=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )

    # 10. chat_sessions (before learning_paths so LP can reference it)
    op.create_table(
        "chat_sessions",
        sa.Column("id", sa.Uuid(), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("workspace_id", sa.Uuid(), sa.ForeignKey("workspaces.id", ondelete="SET NULL"), nullable=True, index=True),
        sa.Column("title", sa.String(), nullable=True),
        sa.Column("objective", sa.String(), nullable=True),
        sa.Column("relevant_experience", sa.String(), nullable=True),
        sa.Column("background", sa.String(), nullable=True),
        sa.Column("relevant_skills", sa.JSON(), nullable=True),
        sa.Column("required_skills", sa.JSON(), nullable=True),
        sa.Column("interests", sa.JSON(), nullable=True),
        sa.Column("time_per_week", sa.String(), nullable=True),
        sa.Column("deadline", sa.String(), nullable=True),
        sa.Column("learning_path_created", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("status", sa.String(), nullable=False, server_default="active"),
        sa.Column("learning_path_id", sa.Uuid(), nullable=True),  # FK added after learning_paths table
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )

    # 11. learning_paths
    op.create_table(
        "learning_paths",
        sa.Column("id", sa.Uuid(), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("workspace_id", sa.Uuid(), sa.ForeignKey("workspaces.id", ondelete="SET NULL"), nullable=True, index=True),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("objective", sa.String(), nullable=True),
        sa.Column("difficulty", sa.String(), nullable=True),
        sa.Column("estimated_duration", sa.String(), nullable=True),
        sa.Column("time_per_week", sa.String(), nullable=True),
        sa.Column("deadline", sa.String(), nullable=True),
        sa.Column("status", sa.String(), nullable=False, server_default="active"),
        sa.Column("total_steps", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("completed_steps", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("progress_percent", sa.Float(), nullable=False, server_default=sa.text("0.0")),
        sa.Column("generated_by", sa.String(), nullable=False, server_default="agent"),
        sa.Column("raw_agent_output", sa.String(), nullable=True),
        sa.Column("chat_session_id", sa.Uuid(), sa.ForeignKey("chat_sessions.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )

    # Add FK from chat_sessions.learning_path_id -> learning_paths.id
    op.create_foreign_key(
        "fk_chat_sessions_learning_path_id",
        "chat_sessions", "learning_paths",
        ["learning_path_id"], ["id"],
        ondelete="SET NULL",
    )

    # 12. learning_path_steps
    op.create_table(
        "learning_path_steps",
        sa.Column("id", sa.Uuid(), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("learning_path_id", sa.Uuid(), sa.ForeignKey("learning_paths.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("content_id", sa.Uuid(), sa.ForeignKey("content.id", ondelete="SET NULL"), nullable=True),
        sa.Column("step_number", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("step_type", sa.String(), nullable=False, server_default="resource"),
        sa.Column("status", sa.String(), nullable=False, server_default="locked"),
        sa.Column("duration", sa.String(), nullable=True),
        sa.Column("url", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )

    # 13. user_progress
    op.create_table(
        "user_progress",
        sa.Column("id", sa.Uuid(), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("learning_path_id", sa.Uuid(), sa.ForeignKey("learning_paths.id", ondelete="CASCADE"), nullable=True),
        sa.Column("step_id", sa.Uuid(), sa.ForeignKey("learning_path_steps.id", ondelete="CASCADE"), nullable=True),
        sa.Column("content_id", sa.Uuid(), sa.ForeignKey("content.id", ondelete="SET NULL"), nullable=True),
        sa.Column("status", sa.String(), nullable=False, server_default="not_started"),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.Column("time_spent_minutes", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("notes", sa.String(), nullable=True),
        sa.Column("rating", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )

    # 14. chat_messages
    op.create_table(
        "chat_messages",
        sa.Column("id", sa.Uuid(), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("session_id", sa.Uuid(), sa.ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("role", sa.String(), nullable=False),
        sa.Column("content", sa.String(), nullable=False),
        sa.Column("embedding", Vector(384), nullable=True),
        sa.Column("message_index", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("extracted_data", sa.JSON(), nullable=True),
        sa.Column("action_triggered", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )

    # 15. content_reviews
    op.create_table(
        "content_reviews",
        sa.Column("id", sa.Uuid(), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("content_id", sa.Uuid(), sa.ForeignKey("content.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("reviewer_type", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=False, server_default="pending"),
        sa.Column("is_accessible", sa.Boolean(), nullable=True),
        sa.Column("is_content_fresh", sa.Boolean(), nullable=True),
        sa.Column("license_compliant", sa.Boolean(), nullable=True),
        sa.Column("quality_score", sa.Float(), nullable=True),
        sa.Column("notes", sa.String(), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(), nullable=True),
        sa.Column("next_review_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )

    # --- HNSW vector indexes ---
    op.execute("CREATE INDEX ix_skills_embedding_hnsw ON skills USING hnsw (embedding vector_cosine_ops)")
    op.execute("CREATE INDEX ix_workspaces_objective_embedding_hnsw ON workspaces USING hnsw (objective_embedding vector_cosine_ops)")
    op.execute("CREATE INDEX ix_content_embedding_hnsw ON content USING hnsw (embedding vector_cosine_ops)")
    op.execute("CREATE INDEX ix_chat_messages_embedding_hnsw ON chat_messages USING hnsw (embedding vector_cosine_ops)")

    # --- Full-text search GIN indexes ---
    op.execute("CREATE INDEX ix_content_fts ON content USING gin (to_tsvector('english', title || ' ' || description))")
    op.execute("CREATE INDEX ix_skills_fts ON skills USING gin (to_tsvector('english', name))")
    op.execute("CREATE INDEX ix_chat_messages_fts ON chat_messages USING gin (to_tsvector('english', content))")


def downgrade() -> None:
    op.drop_table("content_reviews")
    op.drop_table("chat_messages")
    op.drop_table("user_progress")
    op.drop_table("learning_path_steps")
    op.drop_table("learning_paths")
    op.drop_table("chat_sessions")
    op.drop_table("content_tags")
    op.drop_table("content_skills")
    op.drop_table("workspace_content")
    op.drop_table("content")
    op.drop_table("workspace_skills")
    op.drop_table("workspaces")
    op.drop_table("user_skills")
    op.drop_table("skills")
    op.drop_table("users")
    op.execute("DROP EXTENSION IF EXISTS vector")
