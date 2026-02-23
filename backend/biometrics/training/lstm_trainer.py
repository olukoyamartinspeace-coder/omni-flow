import os
import json
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from backend.biometrics.models.database import get_db_connection, get_placeholder

class LSTMBiometricTrainer:
    def __init__(self, user_id):
        self.user_id = user_id
        self.model_dir = os.path.join("frontend", "models", "biometrics", str(user_id), "lstm")
        os.makedirs(self.model_dir, exist_ok=True)
        self.scaler = StandardScaler()
        self.sequence_length = 10 

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

    def create_sequences(self, data):
        """Rule 11: Minimum Dataset Per User. Flattening sequences for RandomForest."""
        sequences = []
        for i in range(len(data) - self.sequence_length):
            seq = data[i:i + self.sequence_length]
            sequences.append(seq.flatten())
        return np.array(sequences)

    def train(self):
        X_raw = self.fetch_samples()
        if len(X_raw) < 20:
            raise ValueError("Not enough samples for sequence training. Need at least 20.")

        X_scaled = self.scaler.fit_transform(X_raw)
        X_seq = self.create_sequences(X_scaled)
        
        y_pos = np.ones(len(X_seq))
        X_neg = X_seq + np.random.normal(0, 0.4, X_seq.shape)
        y_neg = np.zeros(len(X_neg))
        
        X_train = np.vstack([X_seq, X_neg])
        y_train = np.hstack([y_pos, y_neg])

        # Phase 2 Pivot: RandomForest effectively captures feature correlations over time
        self.clf = RandomForestClassifier(n_estimators=100, random_state=42)
        self.clf.fit(X_train, y_train)
        
        model_path = os.path.join(self.model_dir, "model.pkl")
        joblib.dump(self.clf, model_path)
        
        return {
            "status": "lstm_trained",
            "sequences": len(X_seq),
            "model_path": model_path
        }

if __name__ == "__main__":
    trainer = LSTMBiometricTrainer(user_id=1)
