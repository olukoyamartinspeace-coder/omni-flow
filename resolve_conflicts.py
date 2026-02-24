import os
import sys

def resolve_file(filepath):
    print(f"Resolving {filepath}")
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    resolved_lines = []
    in_head = False
    skip = False
    
    for line in lines:
        if line.startswith('<<<<<<< HEAD'):
            in_head = True
            continue
        elif line.startswith('======='):
            in_head = False
            skip = True
            continue
        elif line.startswith('>>>>>>>'):
            skip = False
            continue
            
        if not skip:
            resolved_lines.append(line)
            
    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(resolved_lines)

files_to_resolve = [
    "README.md",
    "backend/__init__.py",
    "backend/biometrics/routes/biometrics.py",
    "backend/biometrics/training/trainer.py",
    "backend/biometrics/training/lstm_trainer.py",
    "backend/biometrics/training/cnn_trainer.py",
    "backend/biometrics/security/limiter.py",
    "backend/biometrics/models/database.py",
    "backend/biometrics/security/anomaly_detector.py",
    "backend/biometrics/benchmarks/run_benchmarks.py",
    "backend/biometrics/fusion/fusion_v2.py",
    "backend/behavioral/engine.py"
]

for file in files_to_resolve:
    full_path = os.path.join(r"c:\Users\oluko\OneDrive\Desktop\omni-flow", file)
    if os.path.exists(full_path):
        resolve_file(full_path)
    else:
        print(f"File not found: {full_path}")
