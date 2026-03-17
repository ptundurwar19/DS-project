"""
Neuro-DS FastAPI Backend
========================
Main application entry point. Configures CORS, mounts routes,
and serves as the orchestrator between React, ML, and C++.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import simulate, history

app = FastAPI(
    title="Neuro-DS API",
    description="AI-Driven Data Structure Oracle — Backend API",
    version="1.0.0"
)

# CORS — allow React dev server (localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(simulate.router, prefix="/api")
app.include_router(history.router, prefix="/api")


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "neuro-ds"}
