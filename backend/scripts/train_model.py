"""
Model Training Script
=====================
Generates synthetic training data by running the C++ engine on many
different workload configurations, then trains a Random Forest classifier.

Usage:
    python scripts/train_model.py

Prerequisites:
    - C++ engine must be compiled first (cd engine && mkdir build && cd build && cmake .. && cmake --build .)
"""
import os
import sys
import json
import random
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.workload_gen import generate_workload
from app.services.feature_extract import extract_features
from app.services.engine_runner import run_engine, cleanup_workload


DS_LABELS = ["avl", "redblack", "splay", "skiplist"]

# Training configurations: vary parameters to create diverse workloads
TRAINING_CONFIGS = []

# Generate a grid of configurations
for size in [1000, 5000, 10000, 25000]:
    for read_r in [0.1, 0.3, 0.5, 0.7, 0.9]:
        for sorted_pct in [0.0, 0.3, 0.6, 0.9]:
            for temp_loc in [0.0, 0.3, 0.6, 0.9]:
                write_r = (1.0 - read_r) * 0.7
                delete_r = (1.0 - read_r) * 0.3
                TRAINING_CONFIGS.append({
                    "dataset_size": size,
                    "read_ratio": read_r,
                    "write_ratio": write_r,
                    "delete_ratio": delete_r,
                    "sortedness": sorted_pct,
                    "temporal_locality": temp_loc,
                })


def generate_training_data(num_samples: int = None) -> pd.DataFrame:
    """
    Generate training data by running diverse workloads through the C++ engine.
    Each row: [features...] + [winner_label]
    """
    configs = TRAINING_CONFIGS
    if num_samples and num_samples < len(configs):
        configs = random.sample(configs, num_samples)

    rows = []
    total = len(configs)

    for i, cfg in enumerate(configs):
        print(f"  [{i+1}/{total}] size={cfg['dataset_size']}, "
              f"read={cfg['read_ratio']:.1f}, sorted={cfg['sortedness']:.1f}, "
              f"locality={cfg['temporal_locality']:.1f}")

        workload_path = None
        try:
            # Generate workload
            workload_path, operations = generate_workload(**cfg)

            # Extract features
            features = extract_features(operations)

            # Run C++ engine
            result = run_engine(workload_path)
            benchmark = result.get("results", {})

            if not benchmark:
                continue

            # Find winner (lowest execution time)
            winner = min(benchmark, key=lambda k: benchmark[k].get("time_us", float("inf")))

            row = {**features, "winner": winner}
            rows.append(row)

        except Exception as e:
            print(f"    SKIP — {e}")
            continue

        finally:
            if workload_path:
                cleanup_workload(workload_path)

    return pd.DataFrame(rows)


def train_model(df: pd.DataFrame) -> None:
    """Train a Random Forest classifier and save it."""
    feature_cols = [
        "read_ratio", "write_ratio", "delete_ratio",
        "dataset_size", "sortedness", "duplicate_ratio",
        "temporal_locality", "key_spread",
    ]

    X = df[feature_cols].values
    y = df["winner"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"\n  Training set: {len(X_train)} samples")
    print(f"  Test set:     {len(X_test)} samples")

    clf = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        n_jobs=-1,
    )
    clf.fit(X_train, y_train)

    # Evaluate
    y_pred = clf.predict(X_test)
    print("\n--- Classification Report ---")
    print(classification_report(y_test, y_pred, target_names=DS_LABELS, zero_division=0))

    # Feature importances
    print("--- Feature Importances ---")
    for name, imp in zip(feature_cols, clf.feature_importances_):
        print(f"  {name:25s} {imp:.4f}")

    # Save model
    model_dir = os.path.join(os.path.dirname(__file__), "..", "app", "models")
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, "oracle_rf.joblib")
    joblib.dump(clf, model_path)
    print(f"\n  Model saved to: {model_path}")


if __name__ == "__main__":
    print("=" * 60)
    print("  Neuro-DS Model Training Pipeline")
    print("=" * 60)

    print("\n[1/2] Generating training data...")
    df = generate_training_data(num_samples=100)  # Use 100 samples for quick training

    if len(df) < 10:
        print("\nERROR: Not enough training data. Make sure the C++ engine is compiled.")
        print("  Run: cd engine && mkdir build && cd build && cmake .. && cmake --build . --config Release")
        sys.exit(1)

    print(f"\n  Generated {len(df)} training samples")
    print(f"  Winner distribution:\n{df['winner'].value_counts().to_string()}")

    print("\n[2/2] Training Random Forest...")
    train_model(df)

    print("\n  Done! Model is ready.")
    print("=" * 60)
