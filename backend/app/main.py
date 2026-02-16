from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import content, learning_paths, progress, search, skills, users, workspaces


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: preload embedding model
    from app.services.embedding_service import get_model
    get_model()
    yield


app = FastAPI(title="SKYE Backend", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(skills.router, prefix="/api/skills", tags=["skills"])
app.include_router(content.router, prefix="/api/content", tags=["content"])
app.include_router(search.router, prefix="/api/search", tags=["search"])
app.include_router(learning_paths.router, prefix="/api/learning-paths", tags=["learning-paths"])
# Chat router disabled — will be replaced by an agent-based architecture.
# To re-enable: uncomment below and add `chat` to the router import above.
# from app.routers import chat
# app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(workspaces.router, prefix="/api/workspaces", tags=["workspaces"])
app.include_router(progress.router, prefix="/api/progress", tags=["progress"])


@app.get("/api/health")
async def health():
    return {"status": "ok"}
