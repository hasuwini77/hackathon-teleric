# Database Setup

## Overview

The API now uses SQLAlchemy ORM with Pydantic for validation. The database schema follows the entity-relationship diagram with proper relationships and constraints.

## Models

- **User**: User accounts with email and profile
- **Session**: Chat sessions tied to users
- **ChatMessage**: Individual messages in a session
- **Skill**: Available skills in the system
- **UserSkill**: User's skill proficiencies with levels
- **LearningPath**: Generated learning paths
- **Lesson**: Individual lessons within a path
- **Evaluation**: Assessments for lessons
- **Goal**: User goals tied to sessions
- **File**: Uploaded files (CVs, resumes, etc.)
- **RequiredSkill**: Skills required for a learning path

## Setup

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Environment Variables

Set your database URL in `.env`:

```
DATABASE_URL=postgresql://user:password@host:port/database
```

### Initialize Database

```python
from api.db import init_db
init_db()
```

### Database Migrations

Create a new migration:

```bash
alembic revision --autogenerate -m "description"
```

Apply migrations:

```bash
alembic upgrade head
```

Rollback:

```bash
alembic downgrade -1
```

## Usage Examples

### Creating a User

```python
from api.db import get_db, get_or_create_user

with get_db() as db:
    user = get_or_create_user(db, "user@example.com", "John Doe")
```

### Saving Conversation

```python
from api.db import save_conversation

save_conversation(
    session_id="session123",
    state="active",
    memory={"objective": "Learn Python"},
    chat_messages=[{"role": "user", "content": "Hello"}]
)
```

### Saving Learning Path

```python
from api.db import save_learning_path

path_id = save_learning_path(
    session_id="session123",
    title="Python Basics",
    objective="Learn Python fundamentals",
    lessons=[
        {
            "title": "Variables and Types",
            "description": "Learn basic data types",
            "duration_hours": 2
        }
    ]
)
```

## Schema Updates

When modifying models in `api/models.py`:

1. Create migration: `alembic revision --autogenerate -m "description"`
2. Review the generated migration in `alembic/versions/`
3. Apply: `alembic upgrade head`
4. Test thoroughly!

## Benefits

✅ **Type Safety**: Pydantic validates all data
✅ **ORM**: Clean database operations with SQLAlchemy
✅ **Migrations**: Version-controlled schema changes
✅ **Relationships**: Proper foreign keys and cascades
✅ **Testable**: Easy to mock and test
