"""
Model Training Script
=====================
Generates synthetic training data using domain-knowledge labels.
Trains a Random Forest classifier that can distinguish between
all 4 data structures: AVL, Red-Black, Splay, and Skip List.

The key insight: raw C++ benchmarks often favor Red-Black Tree due to
constant-factor advantages, causing the model to always predict 'redblack'.
This script uses theoretical domain knowledge to create balanced training
data that reflects WHEN each data structure is the optimal choice.

Usage:
    python scripts/train_model.py
"""
import os
import sys
import random
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib


DS_LABELS = ["avl", "redblack", "splay", "skiplist"]

FEATURE_NAMES = [
    "read_ratio", "write_ratio", "delete_ratio",
    "dataset_size", "sortedness", "duplicate_ratio",
    "temporal_locality", "key_spread",
]


def _domain_label(features: dict) -> str:
    """
    Assign a ground-truth label using domain knowledge about when each
    data structure theoretically excels.

    Decision logic (based on data structures theory):
      - Splay Tree:  high temporal locality (repeated access patterns)
      - AVL Tree:    read-heavy, low locality (strict balance = fast lookups)
      - Skip List:   high sortedness (good for range queries / sorted data)
      - Red-Black:   write/delete-heavy mixed workloads (fewer rotations)
    """
    read_r = features.get("read_ratio", 0)
    write_r = features.get("write_ratio", 0)
    delete_r = features.get("delete_ratio", 0)
    temporal = features.get("temporal_locality", 0)
    sortedness = features.get("sortedness", 0)

    # Priority 1: High temporal locality → Splay Tree
    if temporal > 0.45:
        return "splay"

    # Priority 2: Read-heavy with low mutation → AVL Tree
    if read_r > 0.65 and (write_r + delete_r) < 0.35:
        return "avl"

    # Priority 3: High sortedness → Skip List
    if sortedness > 0.6:
        return "skiplist"

    # Priority 4: Write/delete heavy → Red-Black Tree
    if (write_r + delete_r) > 0.55:
        return "redblack"

    # Priority 5: Moderate read with some locality → Splay
    if temporal > 0.25 and read_r > 0.4:
        return "splay"

    # Priority 6: Balanced workload with high reads → AVL
    if read_r > 0.5:
        return "avl"

    # Default: Red-Black (good general-purpose)
    return "redblack"


def generate_synthetic_features(num_samples: int = 2000) -> pd.DataFrame:
    """
    Generate synthetic feature vectors with domain-knowledge labels.
    This is FAST because it doesn't need to run the C++ engine.

    Generates diverse combinations of workload parameters with some noise
    to make the decision boundaries realistic.
    """
    rows = []
    random.seed(42)
    np.random.seed(42)

    # Systematic grid
    sizes_log = [2.5, 3.0, 3.5, 4.0, 4.5, 5.0]  # log10 scale
    read_ratios = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]
    sortedness_vals = [0.0, 0.15, 0.3, 0.45, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
    locality_vals = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]

    count = 0
    for size_log in sizes_log:
        for read_r in read_ratios:
            for sorted_pct in sortedness_vals:
                for temp_loc in locality_vals:
                    write_r = (1.0 - read_r) * random.uniform(0.5, 0.85)
                    delete_r = 1.0 - read_r - write_r

                    # Add realistic noise to features
                    dup_ratio = random.uniform(0.0, 0.3)
                    key_spread = random.uniform(1.0, 20.0)

                    features = {
                        "read_ratio": round(read_r + np.random.normal(0, 0.02), 4),
                        "write_ratio": round(write_r + np.random.normal(0, 0.02), 4),
                        "delete_ratio": round(max(0, delete_r + np.random.normal(0, 0.01)), 4),
                        "dataset_size": round(size_log + np.random.normal(0, 0.1), 4),
                        "sortedness": round(max(0, min(1, sorted_pct + np.random.normal(0, 0.03))), 4),
                        "duplicate_ratio": round(dup_ratio, 4),
                        "temporal_locality": round(max(0, min(1, temp_loc + np.random.normal(0, 0.03))), 4),
                        "key_spread": round(key_spread, 4),
                    }

                    winner = _domain_label(features)
                    rows.append({**features, "winner": winner})
                    count += 1

                    if count >= num_samples:
                        break
                if count >= num_samples:
                    break
            if count >= num_samples:
                break
        if count >= num_samples:
            break

    # Add extra random samples to fill up to num_samples
    while len(rows) < num_samples:
        read_r = random.uniform(0.05, 0.95)
        write_r = random.uniform(0, 1.0 - read_r)
        delete_r = 1.0 - read_r - write_r

        features = {
            "read_ratio": round(read_r, 4),
            "write_ratio": round(write_r, 4),
            "delete_ratio": round(delete_r, 4),
            "dataset_size": round(random.uniform(2.0, 5.5), 4),
            "sortedness": round(random.uniform(0, 1), 4),
            "duplicate_ratio": round(random.uniform(0, 0.4), 4),
            "temporal_locality": round(random.uniform(0, 1), 4),
            "key_spread": round(random.uniform(0.5, 25.0), 4),
        }

        winner = _domain_label(features)
        rows.append({**features, "winner": winner})

    return pd.DataFrame(rows)


def train_model(df: pd.DataFrame) -> None:
    """Train a Random Forest classifier and save it."""
    feature_cols = FEATURE_NAMES

    X = df[feature_cols].values
    y = df["winner"].values

    # Verify all 4 classes are present
    unique_labels = set(y)
    print(f"\n  Unique labels in dataset: {unique_labels}")
    if len(unique_labels) < 4:
        missing = set(DS_LABELS) - unique_labels
        print(f"  WARNING: Missing labels: {missing}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"\n  Training set: {len(X_train)} samples")
    print(f"  Test set:     {len(X_test)} samples")

    clf = RandomForestClassifier(
        n_estimators=200,
        max_depth=12,
        min_samples_leaf=3,
        random_state=42,
        n_jobs=-1,
        class_weight="balanced",
    )
    clf.fit(X_train, y_train)

    # Evaluate
    y_pred = clf.predict(X_test)
    print("\n--- Classification Report ---")
    print(classification_report(y_test, y_pred, labels=DS_LABELS, zero_division=0))

    # Feature importances
    print("--- Feature Importances ---")
    for name, imp in zip(feature_cols, clf.feature_importances_):
        bar = "█" * int(imp * 50)
        print(f"  {name:25s} {imp:.4f}  {bar}")

    # Quick sanity check: test a few scenarios
    print("\n--- Sanity Check Predictions ---")
    test_cases = [
        ("High read (90r/7w/3d)",      [0.9, 0.07, 0.03, 4.0, 0.0, 0.0, 0.0, 10.0]),
        ("High temporal locality",      [0.5, 0.35, 0.15, 4.0, 0.0, 0.0, 0.8, 10.0]),
        ("High sortedness",             [0.5, 0.35, 0.15, 4.0, 0.85, 0.0, 0.0, 10.0]),
        ("High write/delete",           [0.1, 0.63, 0.27, 4.0, 0.0, 0.0, 0.0, 10.0]),
        ("Balanced default",            [0.5, 0.35, 0.15, 4.0, 0.3, 0.0, 0.3, 10.0]),
    ]
    for name, feats in test_cases:
        proba = clf.predict_proba([feats])[0]
        pred = clf.classes_[np.argmax(proba)]
        conf = max(proba)
        print(f"  {name:30s} => {pred:12s} ({conf:.1%})")

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

    print("\n[1/2] Generating synthetic training data...")
    df = generate_synthetic_features(num_samples=5000)

    if len(df) < 10:
        print("\nERROR: Not enough training data generated.")
        sys.exit(1)

    print(f"\n  Generated {len(df)} training samples")
    print(f"  Winner distribution:\n{df['winner'].value_counts().to_string()}")

    print("\n[2/2] Training Random Forest...")
    train_model(df)

    print("\n  Done! Model is ready.")
    print("=" * 60)
