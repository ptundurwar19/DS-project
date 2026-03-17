"""
ML Predictor Service
====================
Loads the pre-trained Random Forest model and makes predictions.
Also provides explainability via feature importances.
"""
import os
import joblib
import numpy as np
from typing import Dict, Tuple

# Data structure labels (must match training labels)
DS_LABELS = ["avl", "redblack", "splay", "skiplist"]

DS_EXPLANATIONS = {
    "avl": {
        "name": "AVL Tree",
        "strength": "strict height balancing guarantees O(log N) worst-case for all operations",
        "best_for": "lookup-heavy workloads on semi-sorted or random data",
    },
    "redblack": {
        "name": "Red-Black Tree",
        "strength": "relaxed balancing requires fewer rotations than AVL during inserts/deletes",
        "best_for": "mixed read/write workloads with frequent mutations",
    },
    "splay": {
        "name": "Splay Tree",
        "strength": "move-to-root heuristic gives amortized O(log N) with excellent cache behavior for repeated access",
        "best_for": "workloads with high temporal locality (recently accessed keys accessed again)",
    },
    "skiplist": {
        "name": "Skip List",
        "strength": "probabilistic structure with simple implementation and good cache performance",
        "best_for": "concurrent access patterns and range-query workloads",
    },
}

FEATURE_NAMES = [
    "read_ratio", "write_ratio", "delete_ratio",
    "dataset_size", "sortedness", "duplicate_ratio",
    "temporal_locality", "key_spread",
]


class Predictor:
    def __init__(self):
        model_path = os.path.join(
            os.path.dirname(__file__), "..", "models", "oracle_rf.joblib"
        )
        model_path = os.path.normpath(model_path)

        if os.path.exists(model_path):
            self.model = joblib.load(model_path)
            self.model_loaded = True
        else:
            self.model = None
            self.model_loaded = False

    def predict(self, features_array: np.ndarray, features_dict: Dict[str, float]) -> Dict:
        """
        Make a prediction and generate an explanation.

        Returns:
            Dict with 'winner', 'confidence', 'explanation', 'feature_importances'
        """
        if not self.model_loaded:
            return self._fallback_prediction(features_dict)

        # Predict probabilities
        probas = self.model.predict_proba(features_array)[0]
        predicted_idx = np.argmax(probas)
        winner = DS_LABELS[predicted_idx]
        confidence = float(probas[predicted_idx])

        # Feature importances
        importances = dict(zip(FEATURE_NAMES, self.model.feature_importances_.tolist()))

        # Generate explanation
        explanation = self._generate_explanation(winner, features_dict, importances)

        return {
            "winner": winner,
            "confidence": round(confidence, 4),
            "explanation": explanation,
            "feature_importances": {k: round(v, 4) for k, v in importances.items()},
        }

    def _generate_explanation(
        self, winner: str, features: Dict[str, float], importances: Dict[str, float]
    ) -> str:
        """Generate a natural language explanation for the prediction."""
        ds_info = DS_EXPLANATIONS.get(winner, {})
        ds_name = ds_info.get("name", winner)
        strength = ds_info.get("strength", "balanced performance")

        # Find the top 2 most important features
        sorted_feats = sorted(importances.items(), key=lambda x: x[1], reverse=True)
        top_features = sorted_feats[:2]

        feat_descriptions = []
        for feat_name, _ in top_features:
            val = features.get(feat_name, 0)
            if feat_name == "read_ratio":
                feat_descriptions.append(f"{val*100:.0f}% read operations")
            elif feat_name == "write_ratio":
                feat_descriptions.append(f"{val*100:.0f}% write operations")
            elif feat_name == "delete_ratio":
                feat_descriptions.append(f"{val*100:.0f}% delete operations")
            elif feat_name == "sortedness":
                level = "highly sorted" if val > 0.7 else "moderately sorted" if val > 0.4 else "unsorted"
                feat_descriptions.append(f"{level} data ({val*100:.0f}%)")
            elif feat_name == "temporal_locality":
                level = "high" if val > 0.5 else "moderate" if val > 0.2 else "low"
                feat_descriptions.append(f"{level} temporal locality ({val*100:.0f}%)")
            elif feat_name == "key_spread":
                feat_descriptions.append(f"key spread of {val:.1f}")
            elif feat_name == "duplicate_ratio":
                feat_descriptions.append(f"{val*100:.0f}% duplicate keys")
            elif feat_name == "dataset_size":
                feat_descriptions.append(f"dataset size factor of {val:.1f}")

        reason = " and ".join(feat_descriptions)

        return (
            f"The {ds_name} was selected because your workload features {reason}. "
            f"The {ds_name}'s {strength}, making it the optimal choice for this workload profile."
        )

    def _fallback_prediction(self, features: Dict[str, float]) -> Dict:
        """
        Rule-based fallback when no trained model is available.
        Uses heuristic rules based on feature values.
        """
        read_ratio = features.get("read_ratio", 0)
        write_ratio = features.get("write_ratio", 0)
        delete_ratio = features.get("delete_ratio", 0)
        temporal_locality = features.get("temporal_locality", 0)
        sortedness = features.get("sortedness", 0)

        # Heuristic decision
        if temporal_locality > 0.5:
            winner = "splay"
            confidence = 0.75
        elif read_ratio > 0.7:
            winner = "avl"
            confidence = 0.70
        elif write_ratio > 0.6 or delete_ratio > 0.3:
            winner = "redblack"
            confidence = 0.65
        elif sortedness > 0.7:
            winner = "skiplist"
            confidence = 0.60
        else:
            winner = "redblack"
            confidence = 0.55

        explanation = self._generate_explanation(
            winner, features,
            {f: 1.0 / len(FEATURE_NAMES) for f in FEATURE_NAMES}
        )

        return {
            "winner": winner,
            "confidence": confidence,
            "explanation": explanation + " (Note: using heuristic fallback — no trained model found.)",
            "feature_importances": {f: round(1.0 / len(FEATURE_NAMES), 4) for f in FEATURE_NAMES},
        }
