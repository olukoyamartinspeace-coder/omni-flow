<<<<<<< HEAD
import numpy as np
import os
import joblib
from sklearn.ensemble import IsolationForest
from backend.biometrics.models.database import get_db_connection, get_placeholder

class AnomalyDetector:
    def __init__(self, user_id):
        self.user_id = user_id
        self.model_dir = os.path.join("backend", "biometrics", "security", "models", str(user_id))
        os.makedirs(self.model_dir, exist_ok=True)
        self.model_path = os.path.join(self.model_dir, "anomaly_forest.pkl")
        self.clf = self._load_model()

    def _load_model(self):
        if os.path.exists(self.model_path):
            return joblib.load(self.model_path)
        return None

    def train(self, X):
        """
        Rule 11 & 12: AI scores risk. Trains an Isolation Forest on known good user data.
        Any sample that deviates significantly will be flagged as an anomaly (spoof attempt).
        """
        if len(X) < 10:
            return  # Need more data for baseline
            
        self.clf = IsolationForest(contamination=0.05, random_state=42)
        self.clf.fit(X)
        joblib.dump(self.clf, self.model_path)

    def detect(self, feature_vector):
        """
        Returns a risk score.
        1.0 = Highly likely from the user
        0.0 = Highly likely an anomaly/spoof
        """
        if self.clf is None:
            return 1.0  # Pass through if no model yet
            
        X = np.array(feature_vector).reshape(1, -1)
        # decision_function returns signed distance: higher is more "normal"
        # we normalize it roughly to [0, 1]
        score = self.clf.decision_function(X)[0]
        # Isolation Forest decision_function is negative for anomalies, positive for normal
        # A typical normal score is around 0.1-0.2
        confidence = 1.0 / (1.0 + np.exp(-10 * score)) # Sigmoid mapping
        return round(float(confidence), 4)

if __name__ == "__main__":
    # Internal Test
    detector = AnomalyDetector(user_id=1)
    # mock_data = np.random.normal(0, 1, (20, 15))
    # detector.train(mock_data)
    # print(detector.detect(np.random.normal(0, 1, 15)))
=======
import numpy as np
import os
import joblib
from sklearn.ensemble import IsolationForest
from backend.biometrics.models.database import get_db_connection, get_placeholder

class AnomalyDetector:
    def __init__(self, user_id):
        self.user_id = user_id
        self.model_dir = os.path.join("backend", "biometrics", "security", "models", str(user_id))
        os.makedirs(self.model_dir, exist_ok=True)
        self.model_path = os.path.join(self.model_dir, "anomaly_forest.pkl")
        self.clf = self._load_model()

    def _load_model(self):
        if os.path.exists(self.model_path):
            return joblib.load(self.model_path)
        return None

    def train(self, X):
        """
        Rule 11 & 12: AI scores risk. Trains an Isolation Forest on known good user data.
        Any sample that deviates significantly will be flagged as an anomaly (spoof attempt).
        """
        if len(X) < 10:
            return  # Need more data for baseline
            
        self.clf = IsolationForest(contamination=0.05, random_state=42)
        self.clf.fit(X)
        joblib.dump(self.clf, self.model_path)

    def detect(self, feature_vector):
        """
        Returns a risk score.
        1.0 = Highly likely from the user
        0.0 = Highly likely an anomaly/spoof
        """
        if self.clf is None:
            return 1.0  # Pass through if no model yet
            
        X = np.array(feature_vector).reshape(1, -1)
        # decision_function returns signed distance: higher is more "normal"
        # we normalize it roughly to [0, 1]
        score = self.clf.decision_function(X)[0]
        # Isolation Forest decision_function is negative for anomalies, positive for normal
        # A typical normal score is around 0.1-0.2
        confidence = 1.0 / (1.0 + np.exp(-10 * score)) # Sigmoid mapping
        return round(float(confidence), 4)

if __name__ == "__main__":
    # Internal Test
    detector = AnomalyDetector(user_id=1)
    # mock_data = np.random.normal(0, 1, (20, 15))
    # detector.train(mock_data)
    # print(detector.detect(np.random.normal(0, 1, 15)))
>>>>>>> aa92d30cde5631469333d8d66770e30e9a9244ab
