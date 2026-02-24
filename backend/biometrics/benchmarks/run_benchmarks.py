import numpy as np
import time
import json
from backend.biometrics.training.trainer import BiometricTrainer
from backend.biometrics.training.lstm_trainer import LSTMBiometricTrainer
from backend.biometrics.training.cnn_trainer import CNNBiometricTrainer
from backend.biometrics.fusion.fusion_v2 import MultimodalFusionEngineV2

def run_benchmarks():
    print("Starting Biometric Engine Phase 2 Benchmarks...")
    
    user_id = 1
    num_features = 15
    num_samples = 40
    
    # 1. Mock Data Generation
    print("[1/4] Generating mock behavioral data...")
    mock_data = np.random.normal(0, 1, (num_samples, num_features))
    
    # 2. Individual Model Performance
    print("[2/4] Testing individual model training & inference latency...")
    
    # MLP
    start = time.time()
    mlp_trainer = BiometricTrainer(user_id)
    # Mocking fetch_samples to return our generated data
    mlp_trainer.fetch_samples = lambda: mock_data
    mlp_result = mlp_trainer.train()
    print(f"  - MLP Training: {(time.time() - start)*1000:.2f}ms")

    # LSTM
    start = time.time()
    lstm_trainer = LSTMBiometricTrainer(user_id)
    lstm_trainer.fetch_samples = lambda: mock_data
    lstm_result = lstm_trainer.train()
    print(f"  - LSTM Training: {(time.time() - start)*1000:.2f}ms")

    # CNN
    start = time.time()
    cnn_trainer = CNNBiometricTrainer(user_id)
    cnn_trainer.fetch_samples = lambda: mock_data
    cnn_result = cnn_trainer.train()
    print(f"  - CNN Training: {(time.time() - start)*1000:.2f}ms")

    # 3. Fusion Engine Test
    print("[3/4] Testing Multimodal Fusion aggregation...")
    fusion = MultimodalFusionEngineV2(user_id)
    mock_scores = {
        "mlp": 0.88,
        "lstm": 0.92,
        "cnn": 0.85
    }
    fusion_result = fusion.fuse_scores(mock_scores)
    print(f"  - Fusion Score: {fusion_result['confidence']}")
    print(f"  - Liveness Score: {fusion_result['liveness']}")

    # 4. Results Summary
    print("\nBenchmarks Complete (scikit-learn Pivot)")
    summary = {
        "status": "success",
        "mlp_path": mlp_result['model_path'],
        "lstm_path": lstm_result['model_path'],
        "cnn_path": cnn_result['model_path'],
        "fusion_confidence": fusion_result['confidence']
    }
    print(json.dumps(summary, indent=2))

if __name__ == "__main__":
    try:
        run_benchmarks()
    except Exception as e:
        print(f"Benchmark failed: {str(e)}")
