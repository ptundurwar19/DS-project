"""
Feature Extractor Service
=========================
Extracts ML features from a workload configuration or operation list.
These features are fed into the scikit-learn model for prediction.
"""
import numpy as np
from typing import Dict, List


def extract_features(operations: List[Dict], config: Dict = None) -> Dict[str, float]:
    """
    Extract features from a list of operations.

    Features:
        - read_ratio: Fraction of SEARCH operations
        - write_ratio: Fraction of INSERT operations
        - delete_ratio: Fraction of DELETE operations
        - dataset_size: Total number of operations (log-scaled)
        - sortedness: How sorted the key sequence is (0.0 to 1.0)
        - duplicate_ratio: Fraction of duplicate keys
        - temporal_locality: Measure of how often recent keys are re-accessed
        - key_spread: Normalized range of keys (max - min) / count

    Returns:
        Dictionary of feature name -> float value.
    """
    if not operations:
        return _empty_features()

    total = len(operations)
    keys = [op["key"] for op in operations]
    types = [op["type"] for op in operations]

    # Operation ratios
    read_count = types.count(1)
    write_count = types.count(0)
    delete_count = types.count(2)

    read_ratio = read_count / total
    write_ratio = write_count / total
    delete_ratio = delete_count / total

    # Dataset size (log-scaled for model stability)
    size_log = np.log10(max(total, 1))

    # Sortedness: count inversions (sampled for large datasets)
    sortedness = _compute_sortedness(keys)

    # Duplicate ratio
    unique_keys = len(set(keys))
    duplicate_ratio = 1.0 - (unique_keys / total) if total > 0 else 0.0

    # Temporal locality: fraction of searches on the last 100 inserted keys
    temporal_locality = _compute_temporal_locality(operations)

    # Key spread: normalized range
    key_min = min(keys)
    key_max = max(keys)
    key_spread = (key_max - key_min) / max(total, 1)

    features = {
        "read_ratio": round(read_ratio, 4),
        "write_ratio": round(write_ratio, 4),
        "delete_ratio": round(delete_ratio, 4),
        "dataset_size": round(size_log, 4),
        "sortedness": round(sortedness, 4),
        "duplicate_ratio": round(duplicate_ratio, 4),
        "temporal_locality": round(temporal_locality, 4),
        "key_spread": round(key_spread, 4),
    }

    return features


def features_to_array(features: Dict[str, float]) -> np.ndarray:
    """Convert features dict to a numpy array in the correct order for the model."""
    feature_order = [
        "read_ratio", "write_ratio", "delete_ratio",
        "dataset_size", "sortedness", "duplicate_ratio",
        "temporal_locality", "key_spread",
    ]
    return np.array([[features[k] for k in feature_order]])


def _compute_sortedness(keys: list) -> float:
    """
    Estimate how sorted the key sequence is.
    Uses sampled pairwise comparisons for efficiency.
    Returns 0.0 (random) to 1.0 (fully sorted).
    """
    if len(keys) <= 1:
        return 1.0

    sample_size = min(len(keys), 500)
    indices = sorted(np.random.choice(len(keys), sample_size, replace=False))
    sampled = [keys[i] for i in indices]

    in_order = sum(1 for i in range(len(sampled) - 1) if sampled[i] <= sampled[i + 1])
    return in_order / (len(sampled) - 1)


def _compute_temporal_locality(operations: list) -> float:
    """
    Measure how often search operations access recently inserted keys.
    Returns 0.0 (no locality) to 1.0 (high locality).
    """
    recent_inserts = []
    recent_set = set()
    search_hits = 0
    search_total = 0

    for op in operations:
        if op["type"] == 0:  # INSERT
            recent_inserts.append(op["key"])
            recent_set.add(op["key"])
            if len(recent_inserts) > 100:
                removed = recent_inserts.pop(0)
                # Only remove from set if not still in recent list
                if removed not in recent_inserts:
                    recent_set.discard(removed)
        elif op["type"] == 1:  # SEARCH
            search_total += 1
            if op["key"] in recent_set:
                search_hits += 1

    return search_hits / max(search_total, 1)


def _empty_features() -> Dict[str, float]:
    return {
        "read_ratio": 0.0, "write_ratio": 0.0, "delete_ratio": 0.0,
        "dataset_size": 0.0, "sortedness": 0.0, "duplicate_ratio": 0.0,
        "temporal_locality": 0.0, "key_spread": 0.0,
    }
