"""
History Router
==============
GET /api/history — returns past simulation runs from SQLite.
"""
from fastapi import APIRouter
from app.services.history_db import get_history

router = APIRouter()


@router.get("/history")
async def history(limit: int = 50):
    """Get recent simulation history."""
    runs = get_history(limit=limit)
    return {"runs": runs, "total": len(runs)}
