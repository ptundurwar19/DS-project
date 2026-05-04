"""
Simulate Router
===============
POST /api/simulate — the main endpoint that orchestrates
workload generation → feature extraction → ML prediction → C++ benchmarking.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from app.services.workload_gen import generate_workload
from app.services.feature_extract import extract_features, features_to_array
from app.services.predictor import Predictor
from app.services.engine_runner import run_engine, cleanup_workload
from app.services.history_db import save_run
from app.services.gemini_solver import solve_with_gemini

router = APIRouter()

# Initialize the predictor once
predictor = Predictor()


class WorkloadConfig(BaseModel):
    """Request body for workload simulation or NLP problem solving."""
    nlp_mode: bool = False
    problem_text: Optional[str] = None
    
    # Old slider parameters
    dataset_size: int = Field(default=10000, ge=100, le=500000)
    read_ratio: float = Field(default=0.5, ge=0.0, le=1.0)
    write_ratio: float = Field(default=0.4, ge=0.0, le=1.0)
    delete_ratio: float = Field(default=0.1, ge=0.0, le=1.0)
    sortedness: float = Field(default=0.0, ge=0.0, le=1.0)
    temporal_locality: float = Field(default=0.0, ge=0.0, le=1.0)
    key_range_min: int = Field(default=1, ge=0)
    key_range_max: int = Field(default=100000, ge=1)


class SimulateResponse(BaseModel):
    """Full response with prediction and benchmark results."""
    prediction: dict
    benchmark: Optional[dict] = None
    features: Optional[dict] = None
    ai_correct: Optional[bool] = None
    metadata: Optional[dict] = None


@router.post("/simulate", response_model=SimulateResponse)
async def simulate(config: WorkloadConfig):
    """
    Run the full Neuro-DS pipeline:
    Either NLP Problem Analysis OR Workload Benchmarking.
    """
    if config.nlp_mode:
        if not config.problem_text:
            raise HTTPException(status_code=400, detail="Missing problem_text for NLP mode.")
            
        nlp_result = solve_with_gemini(config.problem_text)
        if nlp_result.get("status") == "failed":
            raise HTTPException(status_code=500, detail=nlp_result.get("error", "NLP Failed"))
            
        return {
            "prediction": nlp_result,
            "metadata": {"mode": "nlp_gemini"}
        }

    workload_path = None
    try:
        # Step 1: Generate workload
        workload_path, operations = generate_workload(
            dataset_size=config.dataset_size,
            read_ratio=config.read_ratio,
            write_ratio=config.write_ratio,
            delete_ratio=config.delete_ratio,
            sortedness=config.sortedness,
            temporal_locality=config.temporal_locality,
            key_range_min=config.key_range_min,
            key_range_max=config.key_range_max,
        )

        # Step 2: Extract features
        features = extract_features(operations, config.model_dump())
        features_array = features_to_array(features)

        # Step 3: ML prediction
        prediction = predictor.predict(features_array, features)

        # Step 4: Run C++ engine
        try:
            engine_output = run_engine(workload_path)
            benchmark = engine_output.get("results", {})
            metadata = engine_output.get("metadata", {})
        except RuntimeError as e:
            # Engine not compiled yet — return prediction without benchmarks
            benchmark = {
                "avl": {"time_us": 0, "memory_bytes": 0, "ops_completed": 0},
                "redblack": {"time_us": 0, "memory_bytes": 0, "ops_completed": 0},
                "splay": {"time_us": 0, "memory_bytes": 0, "ops_completed": 0},
                "skiplist": {"time_us": 0, "memory_bytes": 0, "ops_completed": 0},
            }
            metadata = {"error": str(e)}

        # Step 5: Compare — find actual winner (lowest time)
        actual_winner = None
        if benchmark and all(v.get("time_us", 0) > 0 for v in benchmark.values()):
            actual_winner = min(benchmark, key=lambda k: benchmark[k]["time_us"])

        ai_correct = (actual_winner == prediction["winner"]) if actual_winner else True

        response = {
            "prediction": prediction,
            "benchmark": benchmark,
            "features": features,
            "ai_correct": ai_correct,
            "metadata": metadata,
        }

        # Save to history
        try:
            save_run(config.model_dump(), prediction, benchmark, features, ai_correct)
        except Exception:
            pass  # Non-critical

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if workload_path:
            cleanup_workload(workload_path)
