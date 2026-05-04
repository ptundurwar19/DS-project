"""
Simulate Router — v3.0
=======================
POST /api/simulate — AI-powered data structure analysis.
The C++ engine has been replaced by in-browser JS benchmarks.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.services.gemini_solver import solve_with_ai

router = APIRouter()


class SimulateRequest(BaseModel):
    """Request body for AI-powered problem analysis."""
    nlp_mode: bool = True
    problem_text: Optional[str] = None


class SimulateResponse(BaseModel):
    """Response with AI analysis results."""
    prediction: dict
    metadata: Optional[dict] = None


@router.post("/simulate", response_model=SimulateResponse)
async def simulate(config: SimulateRequest):
    """
    Neuro-DS v3.0 AI Analysis Pipeline:
    Takes a natural language problem description and returns
    the optimal data structure recommendation with justification.
    """
    if not config.problem_text:
        raise HTTPException(
            status_code=400,
            detail="Please provide a problem description in problem_text."
        )

    ai_result = solve_with_ai(config.problem_text)

    if ai_result.get("status") == "failed":
        raise HTTPException(
            status_code=500,
            detail=ai_result.get("error", "AI analysis failed. Please try again.")
        )

    return {
        "prediction": ai_result,
        "metadata": {"mode": "ai_gemini", "version": "3.0"}
    }
