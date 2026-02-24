import os
import numpy as np
import joblib
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler
from backend.biometrics.models.database import get_db_connection, get_placeholder

class BiometricTrainer:
    def __init__(self, user_id):
        self.user_id = user_id
        self.model_dir = os.path.join("frontend", "models", "biometrics", str(user_id))
        os.makedirs(self.model_dir, exist_ok=True)
        self.scaler = StandardScaler()

    def fetch_samples(self):
        conn = get_db_connection()
        cur = conn.cursor()
        p = get_placeholder()
        cur.execute(f"SELECT feature_vector FROM biometric_samples WHERE user_id = {p}", (self.user_id,))
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

    def preprocess(self, X):
        # Rule 12: Normalize before training
        X_scaled = self.scaler.fit_transform(X)
        # Rule 13: Detect Outliers (Simplistic z-score filter for prototype)
        z_scores = np.abs((X - X.mean(axis=0)) / (X.std(axis=0) + 1e-6))
        valid_mask = (z_scores < 3).all(axis=1)
        return X_scaled[valid_mask]

    def build_model(self, input_shape):
        model = Sequential([
            layers.Dense(64, activation='relu', input_shape=(input_shape,)),
            layers.Dropout(0.2),
            layers.Dense(32, activation='relu'),
            layers.Dense(1, activation='sigmoid') # Binary classifier: Is this the user?
        ])
        model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
        return model

    def train(self):
        X = self.fetch_samples()
        if len(X) < 20:
            raise ValueError("Not enough samples for training. Need at least 20.")

        X_processed = self.preprocess(X)
        
        # For Phase 1 prototype, we use a simple approach:
        # Positive samples: User's data.
        # Negative samples: Synthetic noise or other users' data (if available).
        # Here we create synthetic negative samples by adding random noise to user data.
        y_pos = np.ones(len(X_processed))
        X_neg = X_processed + np.random.normal(0, 0.5, X_processed.shape)
        y_neg = np.zeros(len(X_neg))
        
        X_train = np.vstack([X_processed, X_neg])
        y_train = np.hstack([y_pos, y_neg])

        # Phase 2 Pivot: Using sklearn MLP instead of TensorFlow
        self.clf = MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=200, random_state=42)
        self.clf.fit(X_train, y_train)
        
        # Save Model
        keras_path = os.path.join(self.model_dir, "model.pkl")
        joblib.dump(self.clf, keras_path)
        
        return {
            "status": "trained",
            "samples_used": len(X_processed),
            "model_path": keras_path
        }

if __name__ == "__main__":
    # Test execution
    trainer = BiometricTrainer(user_id=1)
    # result = trainer.train()
