# OmniFlow.net: Post-Quantum Identity & Authentication

**OmniFlow** is a next-generation decentralized identity protocol built for the **BNB Chain**. It protects users against future quantum threats through CRYSTALS-Dilithium signatures and ensures identity persistence through AI-powered biometrics and DNA-based recovery.

## 🚀 Key Features

### 🔐 1. Quantum-Resistant Wallet
- **On-Chain Quantum Keys**: Register post-quantum public key hashes directly on the **opBNB Mainnet**.
- **Dilithium Signatures**: Authorize transactions using NIST-standard post-quantum cryptography.
- **Proof-of-Quantum**: Transactions include metadata proving signature integrity against quantum attacks.

### 🎭 2. AI Biometric Enrollment
- **MediaPipe Integration**: Real-time facial landmarking and quality scoring in the browser.
- **Local-Only Privacy**: Biometric embeddings are generated and stored locally. Raw data never leaves the device.
- **Liveness Protection**: Passive anti-spoofing logic ensuring "Body-Bound" ownership.

### 🧬 3. DNA-Based Key Recovery
- **RS-Encoded Entropy**: Private keys are converted into DNA base pairs (A, C, G, T) using Reed-Solomon error correction.
- **Biological Storage**: A functional simulation of synthetic DNA ordering for 1000+ year cold storage.
- **Consistency Verification**: Integrated decoding engine to verify backup integrity.

## 🛠️ Technology Stack
- **Smart Contracts**: Solidity 0.8.20, Hardhat
- **Frontend**: Vanilla JS, HTML5, CSS3 (Glassmorphism design)
- **AI/ML**: MediaPipe, TensorFlow.js
- **Blockchain**: BNB Smart Chain (Testnet)

## 📦 Quick Start

### 1. Prerequisites
- Node.js (v18+)
- Browser with Webcam access
- MetaMask (configured for BNB Testnet)

### 2. Installation
```bash
git clone https://github.com/omni-flow/protocol.git
cd omni-flow
npm install
```

### 3. Setup & Development
```bash
# Compile contracts and generate artifacts
node compile.js

# Serve the frontend
npx http-server ./frontend
```
Navigate to `http://localhost:8080`

### 4. Deploy to BNB Testnet
Add your `PRIVATE_KEY` to `.env` and run:
```bash
npx hardhat run scripts/deploy-quantum-wallet.js --network bscTestnet
```

## 📜 Documentation
- [JUDGE_SUMMARY.md](./docs/JUDGE_SUMMARY.md) - High-level overview for hackathon judges.
- [whitepaper.md](./docs/whitepaper.md) - Technical protocol specifications.
- [walkthrough.md](./docs/walkthrough.md) - Step-by-step feature demonstration.

---
**Built for the BNB Chain Challenge 2026**
