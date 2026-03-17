"""
History Database Service
========================
SQLite storage for simulation run history.
"""
import os
import json
import sqlite3
from datetime import datetime
from typing import Dict, List


DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "db", "history.db")
DB_PATH = os.path.normpath(DB_PATH)


def _get_connection() -> sqlite3.Connection:
    """Get a SQLite connection, creating the DB and table if needed."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("""
        CREATE TABLE IF NOT EXISTS runs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            config TEXT NOT NULL,
            prediction TEXT NOT NULL,
            benchmark TEXT NOT NULL,
            features TEXT NOT NULL,
            ai_correct INTEGER NOT NULL
        )
    """)
    conn.commit()
    return conn


def save_run(
    config: Dict, prediction: Dict, benchmark: Dict,
    features: Dict, ai_correct: bool
) -> None:
    """Save a simulation run to the database."""
    conn = _get_connection()
    try:
        conn.execute(
            "INSERT INTO runs (timestamp, config, prediction, benchmark, features, ai_correct) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (
                datetime.now().isoformat(),
                json.dumps(config),
                json.dumps(prediction),
                json.dumps(benchmark),
                json.dumps(features),
                1 if ai_correct else 0,
            ),
        )
        conn.commit()
    finally:
        conn.close()


def get_history(limit: int = 50) -> List[Dict]:
    """Retrieve recent simulation runs."""
    conn = _get_connection()
    try:
        cursor = conn.execute(
            "SELECT * FROM runs ORDER BY id DESC LIMIT ?", (limit,)
        )
        rows = cursor.fetchall()
        return [
            {
                "id": row["id"],
                "timestamp": row["timestamp"],
                "config": json.loads(row["config"]),
                "prediction": json.loads(row["prediction"]),
                "benchmark": json.loads(row["benchmark"]),
                "features": json.loads(row["features"]),
                "ai_correct": bool(row["ai_correct"]),
            }
            for row in rows
        ]
    finally:
        conn.close()
