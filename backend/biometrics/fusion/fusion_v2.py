import os
import json
import numpy as np

class MultimodalFusionEngineV2:
    def __init__(self, user_id):
        self.user_id = user_id
        # Phase 2 Weights
        self.weights = {
            "mlp": 0.2,    # Baseline static features
            "lstm": 0.5,   # Dynamic sequence patterns
            "cnn": 0.3     # Motion signal patterns
        }

    def fuse_scores(self, scores):
        """
        Rule 15: Fusion Must Be Deterministic
        Aggregates scores using weighted average.
        """
        final_score = 0.0
        total_weight = 0.0

        for model_type, score in scores.items():
            if model_type in self.weights:
                weight = self.weights[model_type]
                final_score += score * weight
                total_weight += weight

        if total_weight == 0:
            return 0.0

        normalized_score = final_score / total_weight
        
        # Rule 3: Every Biometric Must Produce a Score (Not Boolean)
        return {
            "confidence": round(normalized_score, 4),
            "liveness": self._calculate_liveness(scores),
            "model_version": "2.0.0",
            "modalities_used": list(scores.keys())
        }

    def _calculate_liveness(self, scores):
        """
        Phase 2: Simple liveness estimation based on consistency between 
        sequence (LSTM) and signal (CNN) models.
        """
        if "lstm" in scores and "cnn" in scores:
            # High variance between models might indicate spoofing
            variance = abs(scores["lstm"] - scores["cnn"])
            liveness = max(0, 1 - variance)
            return round(liveness, 4)
        return 0.5 # Default fallback

if __name__ == "__main__":
    fusion = MultimodalFusionEngineV2(user_id=1)
    test_scores = {"mlp": 0.85, "lstm": 0.92, "cnn": 0.89}
    print(json.dumps(fusion.fuse_scores(test_scores), indent=2))
