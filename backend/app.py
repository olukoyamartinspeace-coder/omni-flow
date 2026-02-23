from flask import Flask, jsonify, request, send_from_directory
import os
from backend.biometrics.security.limiter import limiter
from backend.biometrics.models.database import init_db

# Initialize Flask with frontend directory as static folder
app = Flask(__name__, static_folder='../frontend', static_url_path='')

# Attach limiter
limiter.init_app(app)

# --- Configuration ---
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'default-dev-key')
app.config['DEBUG'] = True

# --- Routes ---

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

from backend.crypto.dilithium import DilithiumMock
from backend.crypto.kyber import KyberMock
from backend.biometrics.processor import BiometricProcessor

dilithium = DilithiumMock()
kyber = KyberMock()
bio_processor = BiometricProcessor()

@app.route('/api/analyze', methods=['POST'])
def analyze_risk():
    """
    Placeholder for AI Risk analysis endpoint.
    Recieves transaction data, returns risk score and optimal execution path.
    """
    data = request.json
    # TODO: Integrate with local AI model (ai_engine/risk_model.py)
    # Placeholder logic
    risk_score = 0.05 # Low risk
    execution_path = "standard_dex_route"
    
    return jsonify({
        "risk_score": risk_score,
        "execution_path": execution_path, 
        "analysis_timestamp": "2026-02-08T12:00:00Z"
    })

# --- Quantum Crypto Endpoints ---

@app.route('/api/crypto/generate_keys', methods=['GET'])
def generate_keys():
    """Generates a new Quantum-Resistant Identity (Dilithium + Kyber)"""
    try:
        sign_pk, sign_sk = dilithium.generate_keypair()
        enc_pk, enc_sk = kyber.keygen()
        
        return jsonify({
            "status": "success",
            "identity": {
                "signing_public_key": sign_pk,
                "encryption_public_key": enc_pk
            },
            # In a real app, private keys never leave the secure enclave/client.
            # Sending here ONLY for prototype demonstration purposes.
            "private_keys_do_not_share": {
                "signing_private_key": sign_sk,
                "encryption_private_key": enc_sk
            }
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/crypto/sign', methods=['POST'])
def sign_transaction():
    """Simulates signing a transaction with quantum keys"""
    data = request.json
    try:
        sk = data.get('private_key')
        message = data.get('message')
        signature = dilithium.sign(sk, message)
        
        return jsonify({
            "status": "success",
            "signature": signature,
            "algorithm": "CRYSTALS-Dilithium2"
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

# --- Biometric Endpoints ---

@app.route('/api/biometrics/process', methods=['POST'])
def process_biometrics():
    """Simulates processing of raw biometric data into a hash"""
    data = request.json
    try:
        # Mock inputs from "sensors"
        iris = data.get('iris_data')
        vein = data.get('vein_data')
        heart = data.get('heartbeat_data')
        
        result = bio_processor.process_biometrics(iris, vein, heart)
        return jsonify({"status": "success", "data": result})
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

# --- DNA Storage Endpoints ---
from backend.dna.encoder import DNAEncoder
from backend.dna.synthesis_mock import TwistBioscienceMock

dna_encoder = DNAEncoder()
dna_lab = TwistBioscienceMock()

@app.route('/api/dna/encode', methods=['POST'])
def encode_dna():
    """Encodes a digital secret (string) into DNA base pairs"""
    data = request.json
    try:
        secret = data.get('secret_data')
        if not secret:
            return jsonify({"status": "error", "message": "No data provided"}), 400
            
        dna_seq = dna_encoder.encode(secret)
        return jsonify({
            "status": "success", 
            "dna_sequence": dna_seq,
            "length_bp": len(dna_seq)
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/dna/order', methods=['POST'])
def order_dna():
    """Places a synthesis order for the DNA sequence"""
    data = request.json
    try:
        sequence = data.get('dna_sequence')
        order = dna_lab.place_order(sequence)
        return jsonify({"status": "success", "order_details": order})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# --- Behavioral Endpoints ---
from backend.behavioral.engine import BehavioralEngine
from backend.biometrics.routes.biometrics import biometrics_bp

init_db() # Ensure tables exist
behavior_engine = BehavioralEngine()
app.register_blueprint(biometrics_bp)

@app.route('/api/behavioral/train', methods=['POST'])
def train_behavior():
    """Updates user profile with new keystroke data"""
    data = request.json
    user_id = "current_user" # Simplified for prototype
    timing_data = data.get('timing_data')
    
    success = behavior_engine.update_profile(user_id, timing_data)
    return jsonify({"status": "success" if success else "ignored"})

@app.route('/api/behavioral/verify', methods=['POST'])
def verify_behavior():
    """Checks current keystrokes against profile"""
    data = request.json
    user_id = "current_user"
    timing_data = data.get('timing_data')
    
    score = behavior_engine.verify_user(user_id, timing_data)
    return jsonify({
        "status": "success",
        "confidence_score": score,
        "is_authenticated": score > 0.6
    })

# --- Metaverse Bridge Endpoints ---
from backend.metaverse.bridge import IdentityBridge

meta_bridge = IdentityBridge()

@app.route('/api/metaverse/bridge', methods=['POST'])
def bridge_identity():
    """Triggers a cross-chain identity export"""
    data = request.json
    chain = data.get('destination_chain')
    user = "0x71C...9B2" # Mock user
    
    result = meta_bridge.export_identity(user, chain)
    return jsonify(result)

# --- Security Endpoints ---
from backend.security.tamper import TamperDetector
from backend.security.deadman import DeadManSwitch

tamper_guard = TamperDetector()
dead_man = DeadManSwitch()

@app.route('/api/security/status', methods=['GET'])
def security_status():
    return jsonify(tamper_guard.check_integrity())

@app.route('/api/security/heartbeat', methods=['POST'])
def heartbeat():
    user_id = "current_user"
    days = request.json.get('threshold_days')
    
    if days:
        dead_man.set_threshold(user_id, int(days))
    
    return jsonify(dead_man.check_in(user_id))

@app.route('/api/security/simulate_lapse', methods=['POST'])
def simulate_lapse():
    user_id = "current_user"
    days = request.json.get('days', 31)
    return jsonify(dead_man.simulate_lapse(user_id, int(days)))

@app.route('/api/security/check_deadman', methods=['GET'])
def check_deadman():
    user_id = "current_user"
    return jsonify(dead_man.get_status(user_id))

# --- Dashboard Endpoints (New) ---

@app.route('/api/wallet/quantum-status', methods=['GET'])
def quantum_status():
    """Returns the current quantum security status of the wallet."""
    return jsonify({
        "status": "active",
        "algorithm": "CRYSTALS-Dilithium-5",
        "nextAssessment": "2026-12-01",
        "migrationProgress": 100,
        "threatLevel": "low"
    })

@app.route('/api/auth/mfa-status', methods=['GET'])
def mfa_status():
    """Returns the status of all authentication factors."""
    return jsonify({
        "biometric": 98,    # 98% Confidence
        "behavioral": 85,   # 85% Match
        "dna": 100,         # Active & Verified
        "seed": 100         # Backed up
    })

@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    """Returns a list of recent transactions with quantum metadata."""
    # Mock data for prototype
    transactions = [
        {
            "id": "tx_0x1a2b3c",
            "type": "Swap",
            "asset": "BNB > OMNI",
            "value": "5.2 BNB",
            "timestamp": "2026-02-09T10:30:00Z",
            "security": "Quantum-Signed (Dilithium)",
            "risk": "Low"
        },
        {
            "id": "tx_0x4d5e6f",
            "type": "Stake",
            "asset": "OMNI",
            "value": "1000 OMNI",
            "timestamp": "2026-02-08T14:15:00Z",
            "security": "Quantum-Signed (Dilithium)",
            "risk": "Low"
        },
        {
            "id": "tx_0x7g8h9i",
            "type": "Bridge",
            "asset": "OMNI (BSC) > OMNI (ETH)",
            "value": "500 OMNI",
            "timestamp": "2026-02-08T09:00:00Z",
            "security": "Multi-Sig + Biometric",
            "risk": "Medium"
        }
    ]
    return jsonify(transactions)

# --- Biometrics Endpoints ---

@app.route('/api/biometrics/confidence-history', methods=['GET'])
def biometric_confidence_history():
    """Returns time-series confidence data for graphing."""
    import random
    from datetime import datetime, timedelta
    
    # Generate 20 data points over the last hour
    history = []
    base_time = datetime.now()
    for i in range(20):
        time_point = base_time - timedelta(minutes=60-i*3)
        history.append({
            "timestamp": time_point.isoformat(),
            "iris": random.randint(92, 99),
            "vein": random.randint(88, 97),
            "heartbeat": random.randint(85, 95)
        })
    return jsonify(history)

@app.route('/api/biometrics/spoof-log', methods=['GET'])
def spoof_log():
    """Returns detected spoof attempts."""
    return jsonify([
        {"timestamp": "2026-02-09T08:30:12Z", "type": "Photo Attack", "sensor": "Iris", "blocked": True},
        {"timestamp": "2026-02-08T14:22:05Z", "type": "Replay Attack", "sensor": "Vein", "blocked": True},
        {"timestamp": "2026-02-07T11:15:33Z", "type": "Synthetic Pattern", "sensor": "Heartbeat", "blocked": True}
    ])

# --- DNA Endpoints ---

@app.route('/api/dna/status', methods=['GET'])
def dna_status():
    """Returns DNA fragment status and degradation."""
    return jsonify({
        "fragments": 4,
        "provider": "Twist Bioscience",
        "orderDate": "2025-12-15",
        "degradation": 2,  # 2% degradation
        "nextVerification": "2026-05-15",
        "recoveryTested": "2026-01-15"
    })

@app.route('/api/dna/simulate-recovery', methods=['POST'])
def simulate_dna_recovery():
    """Simulates DNA recovery process."""
    return jsonify({
        "status": "success",
        "recovered_data": "MOCK_SEED_PHRASE_HASH",
        "integrity": 98,
        "duration_ms": 1247
    })

# --- Metaverse Endpoints ---

@app.route('/api/metaverse/identities', methods=['GET'])
def metaverse_identities():
    """Returns connected platform identities."""
    return jsonify([
        {"platform": "Decentraland", "username": "OmniUser#4821", "status": "connected", "lastSync": "2026-02-09T12:00:00Z"},
        {"platform": "The Sandbox", "username": "omni_builder", "status": "connected", "lastSync": "2026-02-09T11:30:00Z"},
        {"platform": "Spatial", "username": "OmniFlow", "status": "pending", "lastSync": None},
        {"platform": "Roblox", "username": "Not Connected", "status": "disconnected", "lastSync": None}
    ])

@app.route('/api/metaverse/assets', methods=['GET'])
def metaverse_assets():
    """Returns cross-platform asset inventory."""
    return jsonify([
        {"name": "Quantum Armor Set", "platform": "Decentraland", "type": "Wearable", "rarity": "Epic"},
        {"name": "OmniFlow HQ", "platform": "The Sandbox", "type": "Land", "rarity": "Unique"},
        {"name": "Cyber Pet - Phoenix", "platform": "Decentraland", "type": "Companion", "rarity": "Legendary"}
    ])

@app.route('/api/metaverse/transactions', methods=['GET'])
def metaverse_transactions():
    """Returns metaverse transaction history."""
    return jsonify([
        {"id": "mv_tx_001", "action": "Purchased Land", "platform": "The Sandbox", "value": "2.5 ETH", "timestamp": "2026-02-08T16:20:00Z"},
        {"id": "mv_tx_002", "action": "Minted Wearable", "platform": "Decentraland", "value": "0.15 MANA", "timestamp": "2026-02-07T10:15:00Z"},
        {"id": "mv_tx_003", "action": "Identity Bridge", "platform": "Spatial", "value": "Gas: 0.002 ETH", "timestamp": "2026-02-06T14:30:00Z"}
    ])

# --- Security Endpoints ---

@app.route('/api/security/threats', methods=['GET'])
def security_threats():
    """Returns threat intelligence data."""
    return jsonify({
        "personalThreatLevel": "low",
        "recentThreats": [
            {"type": "Phishing Attempt", "severity": "medium", "blocked": True, "timestamp": "2026-02-09T09:15:00Z"},
            {"type": "Unusual Login Location", "severity": "low", "blocked": False, "timestamp": "2026-02-08T18:30:00Z"}
        ],
        "globalAlerts": 3
    })

@app.route('/api/security/audit-log', methods=['GET'])
def audit_log():
    """Returns security event log."""
    return jsonify([
        {"event": "Biometric Verification", "result": "Success", "ip": "192.168.1.100", "timestamp": "2026-02-09T13:00:00Z"},
        {"event": "Transaction Signed", "result": "Success", "ip": "192.168.1.100", "timestamp": "2026-02-09T10:30:00Z"},
        {"event": "Failed Login Attempt", "result": "Blocked", "ip": "45.123.67.89", "timestamp": "2026-02-09T09:15:00Z"},
        {"event": "MFA Challenge", "result": "Success", "ip": "192.168.1.100", "timestamp": "2026-02-08T14:00:00Z"}
    ])

@app.route('/api/security/protocols', methods=['GET'])
def security_protocols():
    """Returns emergency protocol configurations."""
    return jsonify({
        "emergencyFreeze": {"enabled": True, "triggerConditions": ["Multi-failed auth", "Geofence breach"]},
        "deadManSwitch": {"enabled": True, "threshold": "30 days", "lastCheckIn": "2026-02-09T00:00:00Z"},
        "geofence": {"enabled": False, "allowedRegions": []},
        "quantumMigration": {"status": "complete", "assetsProtected": 100}
    })

# --- AI Execution Endpoints ---

@app.route('/api/ai/configure', methods=['POST'])
def ai_configure():
    """Updates AI agent configuration."""
    config = request.json
    # In real implementation, save config to database
    return jsonify({"status": "success", "message": "AI configuration updated"})

@app.route('/api/ai/status', methods=['GET'])
def ai_status():
    """Returns current AI agent status."""
    return jsonify({
        "active": True,
        "strategy": "Balanced",
        "uptime": "14d 6h 32m",
        "lastDecision": "2026-02-09T12:58:00Z",
        "queuedActions": 2
    })

@app.route('/api/ai/performance', methods=['GET'])
def ai_performance():
    """Returns AI performance metrics."""
    return jsonify({
        "totalExecutions": 1247,
        "successRate": 94.3,
        "avgGasSavings": 23.7,
        "roi": 12.4,
        "netProfit": "+$4,821"
    })

@app.route('/api/ai/decisions', methods=['GET'])
def ai_decisions():
    """Returns recent AI decisions log."""
    return jsonify([
        {"action": "Rebalanced LP Position", "pool": "BNB/USDT", "result": "+0.8% APY", "timestamp": "2026-02-09T12:58:00Z"},
        {"action": "Executed Arbitrage", "pair": "OMNI/ETH", "result": "+$23.50", "timestamp": "2026-02-09T11:45:00Z"},
        {"action": "Gas Optimization", "saved": "0.003 BNB", "result": "Success", "timestamp": "2026-02-09T10:30:00Z"},
        {"action": "Risk Assessment", "protocol": "PancakeSwap", "result": "Low Risk", "timestamp": "2026-02-09T09:15:00Z"}
    ])

if __name__ == '__main__':
    app.run(debug=True)
