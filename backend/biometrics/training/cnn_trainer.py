import os
import json
import numpy as np
import joblib
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler
from backend.biometrics.models.database import get_db_connection, get_placeholder

class CNNBiometricTrainer:
    def __init__(self, user_id):
        self.user_id = user_id
        self.model_dir = os.path.join("frontend", "models", "biometrics", str(user_id), "cnn")
        os.makedirs(self.model_dir, exist_ok=True)
        self.scaler = StandardScaler()

    def fetch_samples(self):
        conn = get_db_connection()
        cur = conn.cursor()
        p = get_placeholder()
        cur.execute(f"SELECT feature_vector FROM biometric_samples WHERE user_id = {p} ORDER BY created_at ASC", (self.user_id,))
        rows = cur.fetchall()
        
        samples = []
        is_sqlite = "sqlite" in str(type(conn)).lower()
        
        for r in rows:
            fv = r['feature_vector']
            if is_sqlite and isinstance(fv, str):
                fv = json.loads(fv)
            samples.append(fv)
            
        cur.close()
        conn.close()
        return np.array(samples)

    def train(self):
        X_raw = self.fetch_samples()
        if len(X_raw) < 30:
            raise ValueError("Not enough samples for signal training. Need at least 30.")

        X_scaled = self.scaler.fit_transform(X_raw)
        
        y_pos = np.ones(len(X_scaled))
        X_neg = X_scaled + np.random.normal(0, 0.3, X_scaled.shape)
        y_neg = np.zeros(len(X_neg))
        
        X_train = np.vstack([X_scaled, X_neg])
        y_train = np.hstack([y_pos, y_neg])

        # Phase 2 Pivot: Using deep MLP for pattern recognition
        self.clf = MLPClassifier(hidden_layer_sizes=(128, 64, 32), max_iter=400, random_state=42)
        self.clf.fit(X_train, y_train)
        
        model_path = os.path.join(self.model_dir, "model.pkl")
        joblib.dump(self.clf, model_path)
        
        return {
            "status": "cnn_trained",
            "samples": len(X_scaled),
            "model_path": model_path
        }

if __name__ == "__main__":
    trainer = CNNBiometricTrainer(user_id=1)
