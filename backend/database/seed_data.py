"""Seed the skills table from the RECOGNIZED_SKILLS list."""
import asyncio
import sys
from pathlib import Path

# Ensure backend/ is on sys.path when run from any directory
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select

from database.connection import async_session_factory
from database.models.skill import Skill
from app.services.embedding_service import embed_batch

RECOGNIZED_SKILLS = {
    "Programming Languages": [
        "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Ruby", "Go", "Rust", "PHP", "Swift", "Kotlin",
    ],
    "Web Technologies": [
        "React", "Vue.js", "Angular", "Next.js", "Node.js", "Express", "HTML", "CSS", "Tailwind CSS", "SASS",
    ],
    "Mobile Development": [
        "React Native", "Flutter", "iOS Development", "Android Development",
    ],
    "Backend & Databases": [
        "SQL", "PostgreSQL", "MongoDB", "MySQL", "Redis", "GraphQL", "REST API", "Microservices",
    ],
    "DevOps & Cloud": [
        "Docker", "Kubernetes", "AWS", "Azure", "GCP", "CI/CD", "Jenkins", "Git", "GitHub Actions",
    ],
    "Data & AI": [
        "Machine Learning", "Data Analysis", "TensorFlow", "PyTorch", "Pandas", "NumPy", "Data Visualization",
    ],
    "Business & Soft Skills": [
        "Project Management", "Agile", "Scrum", "Leadership", "Communication", "Problem Solving",
        "Team Collaboration", "Product Management", "UX Design", "UI Design", "Marketing", "Sales", "Business Strategy",
    ],
}


async def seed():
    async with async_session_factory() as db:
        # Collect all skills to insert
        all_skills: list[tuple[str, str]] = []
        for category, skills in RECOGNIZED_SKILLS.items():
            for skill_name in skills:
                all_skills.append((skill_name, category))

        # Check which already exist
        result = await db.execute(select(Skill.name))
        existing = {row[0] for row in result.all()}

        to_insert = [(name, cat) for name, cat in all_skills if name not in existing]
        if not to_insert:
            print("All skills already seeded.")
            return

        # Generate embeddings in batch
        names = [name for name, _ in to_insert]
        print(f"Generating embeddings for {len(names)} skills...")
        embeddings = embed_batch(names)

        for (name, category), emb in zip(to_insert, embeddings):
            skill = Skill(
                name=name,
                category=category,
                description=f"{name} — {category}",
                embedding=emb,
            )
            db.add(skill)

        await db.commit()
        print(f"Seeded {len(to_insert)} skills with embeddings.")


if __name__ == "__main__":
    asyncio.run(seed())
