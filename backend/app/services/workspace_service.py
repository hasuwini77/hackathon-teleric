import uuid

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from database.models.workspace import Workspace
from database.models.workspace_skill import WorkspaceSkill
from app.services.embedding_service import embed


async def find_or_create_workspace(
    db: AsyncSession,
    user_id: uuid.UUID,
    objective: str,
    skill_ids: list[uuid.UUID] | None = None,
    session_title: str | None = None,
) -> Workspace:
    """Auto-match a session to an existing workspace or create a new one.

    Logic:
    1. Embed the objective
    2. Find nearest workspaces by cosine similarity
    3. Check skill overlap
    4. If similarity > 0.8 AND skill overlap > 50% -> attach to existing
    5. Else -> create new workspace
    """
    objective_vec = embed(objective)
    skill_ids = skill_ids or []

    # Find nearest workspaces for this user
    result = await db.execute(
        text("""
            SELECT id, name, objective,
                   1 - (objective_embedding <=> CAST(:vec AS vector)) AS similarity
            FROM workspaces
            WHERE user_id = :user_id
              AND status = 'active'
              AND objective_embedding IS NOT NULL
            ORDER BY objective_embedding <=> CAST(:vec AS vector)
            LIMIT 5
        """),
        {"user_id": user_id, "vec": str(objective_vec)},
    )
    candidates = result.mappings().all()

    best_match: Workspace | None = None
    best_score = 0.0

    for cand in candidates:
        sim = float(cand["similarity"])
        if sim < 0.8:
            continue

        # Check skill overlap if we have skills
        if skill_ids:
            ws_skills_result = await db.execute(
                select(WorkspaceSkill.skill_id).where(WorkspaceSkill.workspace_id == cand["id"])
            )
            ws_skill_ids = {row[0] for row in ws_skills_result.all()}
            if ws_skill_ids:
                overlap = len(set(skill_ids) & ws_skill_ids) / len(set(skill_ids) | ws_skill_ids)
                if overlap < 0.5:
                    continue
                combined = sim * 0.6 + overlap * 0.4
            else:
                combined = sim
        else:
            combined = sim

        if combined > best_score:
            best_score = combined
            best_match_id = cand["id"]

    if best_match is not None or best_score > 0:
        # Fetch the actual workspace object
        if best_score > 0:
            ws = await db.get(Workspace, best_match_id)
            if ws:
                return ws

    # Create new workspace
    name = session_title or objective[:60]
    ws = Workspace(
        user_id=user_id,
        name=name,
        objective=objective,
        objective_embedding=objective_vec,
        status="active",
    )
    db.add(ws)
    await db.flush()

    # Link skills to workspace
    for sid in skill_ids:
        ws_skill = WorkspaceSkill(
            workspace_id=ws.id,
            skill_id=sid,
            source="auto_matched",
        )
        db.add(ws_skill)

    await db.flush()
    return ws
