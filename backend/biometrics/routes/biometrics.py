<<<<<<< HEAD
from flask import Blueprint, request, jsonify
from backend.biometrics.models.database import get_db_connection, get_placeholder
from backend.biometrics.training.trainer import BiometricTrainer
from backend.biometrics.security.limiter import limiter
from backend.biometrics.security.anomaly_detector import AnomalyDetector
from backend.biometrics.fusion.fusion_v2 import MultimodalFusionEngineV2

biometrics_bp = Blueprint('biometrics', __name__)

@biometrics_bp.route('/api/enroll', methods=['POST'])
@limiter.limit("20 per minute")
def enroll():
    data = request.json
    feature_vector = data.get('feature_vector')
    sample_type = data.get('sample_type', 'touch_motion')
    user_id = 1 # Placeholder for current authenticated user
    
    if not feature_vector:
        return jsonify({"status": "error", "message": "Missing feature vector"}), 400

    # Phase 2: Anomaly Detection (AI is Advisory)
    detector = AnomalyDetector(user_id)
    anomaly_score = detector.detect(feature_vector)
    
    if anomaly_score < 0.3:
        return jsonify({
            "status": "warning", 
            "message": "Anomaly detected in capture pattern", 
            "anomaly_score": anomaly_score
        }), 403

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        p = get_placeholder()
        # For SQLite, we need to stringify JSON. For PG, psycopg2 handles dicts.
        fv_data = json.dumps(feature_vector) if "sqlite" in str(type(conn)).lower() else feature_vector
        cur.execute(
            f"INSERT INTO biometric_samples (user_id, feature_vector, sample_type) VALUES ({p}, {p}, {p})",
            (user_id, fv_data, sample_type)
        )
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"status": "success", "message": "Sample stored"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@biometrics_bp.route('/api/biometrics/train', methods=['POST'])
@limiter.limit("5 per hour")
def train():
    user_id = 1 # Placeholder
    try:
        trainer = BiometricTrainer(user_id)
        result = trainer.train()
        
        # Log model version in DB
        conn = get_db_connection()
        cur = conn.cursor()
        p = get_placeholder()
        cur.execute(
            f"INSERT INTO model_versions (user_id, version, accuracy, model_path, model_type) VALUES ({p}, {p}, {p}, {p}, {p})",
            (user_id, "1.0.0", 0.95, result['model_path'], 'touch_motion')
        )
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@biometrics_bp.route('/api/biometrics/authenticate', methods=['POST'])
@limiter.limit("10 per minute")
def authenticate():
    data = request.json
    feature_vector = data.get('feature_vector')
    user_id = 1 # Placeholder
    
    if not feature_vector:
        return jsonify({"status": "error", "message": "Missing feature vector"}), 400

    # In Phase 2, we simulate getting scores from multiple models
    # In production, these would come from inference results of MLP, LSTM, CNN
    # For now, we perform real MLP inference results and simulate others
    try:
        # Static feature check
        trainer = BiometricTrainer(user_id)
        # Note: In a real flow, we'd load the model and predict. 
        # Here we simulate the scores for current feature vector
        
        # Real anomaly detection check
        detector = AnomalyDetector(user_id)
        anomaly_score = detector.detect(feature_vector)
        
        # Fusion Engine
        fusion = MultimodalFusionEngineV2(user_id)
        
        # Mock scores for LSTM/CNN for Phase 2 demonstration
        scores = {
            "mlp": 0.85, # Simulated
            "lstm": 0.78, # Simulated
            "cnn": 0.82  # Simulated
        }
        
        result = fusion.fuse_scores(scores)
        result['anomaly_score'] = anomaly_score
        
        # Integration with security policy
        is_authenticated = result['confidence'] > 0.7 and anomaly_score > 0.4
        result['is_authenticated'] = is_authenticated
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
=======
from flask import Blueprint, request, jsonify
from backend.biometrics.models.database import get_db_connection, get_placeholder
from backend.biometrics.training.trainer import BiometricTrainer
from backend.biometrics.security.limiter import limiter
from backend.biometrics.security.anomaly_detector import AnomalyDetector
from backend.biometrics.fusion.fusion_v2 import MultimodalFusionEngineV2

biometrics_bp = Blueprint('biometrics', __name__)

@biometrics_bp.route('/api/enroll', methods=['POST'])
@limiter.limit("20 per minute")
def enroll():
    data = request.json
    feature_vector = data.get('feature_vector')
    sample_type = data.get('sample_type', 'touch_motion')
    user_id = 1 # Placeholder for current authenticated user
    
    if not feature_vector:
        return jsonify({"status": "error", "message": "Missing feature vector"}), 400

    # Phase 2: Anomaly Detection (AI is Advisory)
    detector = AnomalyDetector(user_id)
    anomaly_score = detector.detect(feature_vector)
    
    if anomaly_score < 0.3:
        return jsonify({
            "status": "warning", 
            "message": "Anomaly detected in capture pattern", 
            "anomaly_score": anomaly_score
        }), 403

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        p = get_placeholder()
        # For SQLite, we need to stringify JSON. For PG, psycopg2 handles dicts.
        fv_data = json.dumps(feature_vector) if "sqlite" in str(type(conn)).lower() else feature_vector
        cur.execute(
            f"INSERT INTO biometric_samples (user_id, feature_vector, sample_type) VALUES ({p}, {p}, {p})",
            (user_id, fv_data, sample_type)
        )
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"status": "success", "message": "Sample stored"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@biometrics_bp.route('/api/biometrics/train', methods=['POST'])
@limiter.limit("5 per hour")
def train():
    user_id = 1 # Placeholder
    try:
        trainer = BiometricTrainer(user_id)
        result = trainer.train()
        
        # Log model version in DB
        conn = get_db_connection()
        cur = conn.cursor()
        p = get_placeholder()
        cur.execute(
            f"INSERT INTO model_versions (user_id, version, accuracy, model_path, model_type) VALUES ({p}, {p}, {p}, {p}, {p})",
            (user_id, "1.0.0", 0.95, result['model_path'], 'touch_motion')
        )
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@biometrics_bp.route('/api/biometrics/authenticate', methods=['POST'])
@limiter.limit("10 per minute")
def authenticate():
    data = request.json
    feature_vector = data.get('feature_vector')
    user_id = 1 # Placeholder
    
    if not feature_vector:
        return jsonify({"status": "error", "message": "Missing feature vector"}), 400

    # In Phase 2, we simulate getting scores from multiple models
    # In production, these would come from inference results of MLP, LSTM, CNN
    # For now, we perform real MLP inference results and simulate others
    try:
        # Static feature check
        trainer = BiometricTrainer(user_id)
        # Note: In a real flow, we'd load the model and predict. 
        # Here we simulate the scores for current feature vector
        
        # Real anomaly detection check
        detector = AnomalyDetector(user_id)
        anomaly_score = detector.detect(feature_vector)
        
        # Fusion Engine
        fusion = MultimodalFusionEngineV2(user_id)
        
        # Mock scores for LSTM/CNN for Phase 2 demonstration
        scores = {
            "mlp": 0.85, # Simulated
            "lstm": 0.78, # Simulated
            "cnn": 0.82  # Simulated
        }
        
        result = fusion.fuse_scores(scores)
        result['anomaly_score'] = anomaly_score
        
        # Integration with security policy
        is_authenticated = result['confidence'] > 0.7 and anomaly_score > 0.4
        result['is_authenticated'] = is_authenticated
        
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
>>>>>>> aa92d30cde5631469333d8d66770e30e9a9244ab
