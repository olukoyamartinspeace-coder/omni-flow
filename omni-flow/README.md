<img width="1920" height="1046" alt="screencapture-127-0-0-1-5000-2026-02-16-11_20_53" src="https://github.com/user-attachments/assets/6ec762b7-9ed9-4389-ba63-6be32cf3f113" />
# OmniFlow - Quantum-Resistant DeFi Identity Platform

**OmniFlow** is a next-generation, quantum-resistant decentralized identity and authentication platform built for the **BNB Chain** ecosystem. It combines cutting-edge **post-quantum cryptography**, **multi-modal biometrics**, **DNA-based key recovery**, and **AI-powered execution** to create the most secure Web3 wallet and identity system ever built.

> **Mission**: Protect digital identities from quantum computers, human error, and social engineering through biological authentication and irreversible DNA backup.

---

## 🚀 Features

<img width="1920" height="912" alt="screencapture-localhost-5000-2026-02-09-14_16_28" src="https://github.com/user-attachments/assets/9610e99f-084f-4cb1-b2b8-01b6f6796a5b" />
### 🔐 Quantum-Resistant Security
- **CRYSTALS-Dilithium-5** for digital signatures
- **Kyber** for key encapsulation
- Future-proof against quantum computing attacks

<img width="1920" height="2042" alt="screencapture-localhost-5000-2026-02-09-14_16_40" src="https://github.com/user-attachments/assets/50b3168c-d859-4e23-98cd-79ad72e19112" />
### 👁️ Multi-Modal Biometric Authentication
- **Iris scanning** with liveness detection
- **Palm vein mapping** for uniqueness
- **ECG heartbeat** patterns for anti-spoofing
- **Behavioral analytics** (keystroke dynamics)

<img width="1920" height="1001" alt="screencapture-localhost-5000-2026-02-09-14_17_17" src="https://github.com/user-attachments/assets/5239f75e-7a56-4682-8fde-59aeacc4e5e7" />
### 🧬 DNA-Based Key Recovery
- Encode seed phrases into synthetic DNA sequences
- Partner with **Twist Bioscience** for fragment synthesis
- Ultimate backup with 1000+ year longevity
- Quarterly verification with QR + UV photo
<img width="1920" https://github.com/user-attachments/assets/0135a64e-bab1-4105-88b8-9ed34c8b6d6f"eight="912" alt="screencapture-localhost-5000-2026-02-09-14_17_35" src="h />

### 🌐 Metaverse Identity Bridge
- Cross-platform identity using **Zero-Knowledge Proofs (ZKP)**
- Supports **Decentraland**, **The Sandbox**, **Spatial**, **Roblox**
- Asset unification across virtual worlds
- **LayerZero** integration for seamless bridging

<img width="1920" height="1058" alt="screencapture-localhost-5000-2026-02-09-14_17_56" sr="https://github.com/user-attachments/assets/ac11e478-0b99-46c4-8230-173f0eb7924d" />
### 🛡️ Security Command Center
- Real-time threat intelligence dashboard
- Emergency protocol management (wallet freeze, geofence)
- 30-day **Dead Man's Switch** for inheritance
- Comprehensive security audit trail

<img width="1920" height="1180" alt="screencapture-127-0-0-1-5000-2026-02-16-12_59_59" src="https://github.com/user-attachments/assets/68b4e147-b31c-41ac-906b-151b02fd901b" />
### 🤖 AI Execution Engine
- Autonomous **DeFi optimization** (yield farming, LP rebalancing)
- Gas fee optimization
- Risk-adjusted strategy execution
- Real-time performance analytics

---

## 🛠️ Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | HTML5, Vanilla CSS3 (Glassmorphism), ES6+ JavaScript, Chart.js |
| **Backend** | Python 3.11+, Flask |
| **Blockchain** | BNB Chain, Solidity |
| **Cryptography** | CRYSTALS-Dilithium, Kyber, SHA3-512 |
| **AI/ML** | Python (Behavioral Analysis, Risk Scoring) |



---

## 📦 Quick Start

### Prerequisites
- Python 3.11+
- Modern web browser (Chrome, Firefox, Edge)
- BNB Chain wallet (Binance Web3 Wallet recommended)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/olukoyamartinspeace-coder/omni-flow.git
cd omni-flow
```

**2. Install backend dependencies**
```bash
pip install -r backend/requirements.txt
```

**3. Run the backend server**
```bash
python -m backend.app
```

> ⚠️ **IMPORTANT**: Always use `python -m backend.app` (NOT `python backend/app.py`) to avoid import errors.

**4. Open the application**
Navigate to `http://127.0.0.1:5000` in your browser

---

## 📊 Dashboard Pages

### 1. **Connect Wallet & Dashboard**
- Binance Web3 Wallet integration
- Quantum security status monitor
- MFA authentication breakdown (donut chart)
- Recent transaction feed
- Quick action panel (Send, Swap, Bridge, Emergency Freeze)

### 2. **Biometrics** (`/biometrics`)
- Live webcam capture interface with IR filter
- Real-time confidence graphing (Chart.js line chart)
- Behavioral pattern heatmap (28-day calendar)
- Spoof detection log

### 3. **DNA Backup** (`/dna`)
- Fragment ordering workflow (Configure → Encode → Order → Track)
- Health degradation monitoring
- DNA recovery simulation
- Verification interface (QR scan + UV photo)

### 4. **Metaverse** (`/metaverse`)
- Connected platform manager (4 platforms)
- Cross-platform asset browser
- Identity bridge configuration (privacy levels)
- Unified transaction feed

### 5. **Security** (`/security`)
- Threat intelligence dashboard
- Emergency protocol cards (Freeze, Dead Man's Switch)
- Security audit trail (table view)
- Quantum migration progress tracker

### 6. **AI Execution** (`/execution`)
- Agent configuration panel (strategy, risk, position size)
- Live execution monitor (updates every 10s)
- Performance analytics (5 metrics)
- Decision history feed

---

## 🌐 API Documentation

All API endpoints return JSON responses. Mock data is currently used for prototype demonstration.

### Dashboard Endpoints

**GET /api/wallet/quantum-status**
```json
{
  "status": "active",
  "algorithm": "CRYSTALS-Dilithium-5",
  "nextAssessment": "2026-12-01",
  "migrationProgress": 100,
  "threatLevel": "low"
}
```

**GET /api/auth/mfa-status**
```json
{
  "biometric": 98,
  "behavioral": 85,
  "dna": 100,
  "seed": 100
}
```

**GET /api/transactions**
Returns array of recent transactions with quantum metadata.

### Biometrics Endpoints

**GET /api/biometrics/confidence-history**  
Returns 20 data points of time-series confidence scores (iris, vein, heartbeat).

**GET /api/biometrics/spoof-log**  
Returns detected spoofing attempts.

### DNA Endpoints

**GET /api/dna/status**
```json
{
  "fragments": 4,
  "provider": "Twist Bioscience",
  "orderDate": "2025-12-15",
  "degradation": 2,
  "nextVerification": "2026-05-15",
  "recoveryTested": "2026-01-15"
}
```

**POST /api/dna/simulate-recovery**  
Simulates quarterly DNA recovery test.

### Metaverse Endpoints

**GET /api/metaverse/identities** - Connected platform identities  
**GET /api/metaverse/assets** - Cross-platform asset inventory  
**GET /api/metaverse/transactions** - Metaverse transaction history

### Security Endpoints

**GET /api/security/threats** - Threat intelligence data  
**GET /api/security/audit-log** - Security event log  
**GET /api/security/protocols** - Emergency protocol configurations

### AI Execution Endpoints

**POST /api/ai/configure** - Updates AI agent configuration  
**GET /api/ai/status** - Current agent status  
**GET /api/ai/performance** - Performance metrics  
**GET /api/ai/decisions** - Recent AI decisions log

---

## 🎨 UI/UX Design

- **Glassmorphism** aesthetic with frosted glass panels
- **Dark Mode** cyberpunk theme
- **Responsive** design (768px tablet, 480px mobile, 360px ultra-mobile)
- **Smooth animations** (page transitions, button ripples, hover effects)
- **Toast notifications** for errors and success messages
- **Loading spinners** for async operations
- **Chart.js** for data visualization

---

## 🚢 Deployment

### BNB Chain Testnet Deployment

**1. Compile smart contracts**
```bash
cd contracts
npx hardhat compile
```

**2. Deploy to BNB Testnet**
```bash
npx hardhat run scripts/deploy.js --network bnb_testnet
```

**3. Update frontend configuration**
Edit `frontend/js/app.js` to point to deployed contract addresses.



---

## 🔒 Security Notes

> **⚠️ Critical Security Principles**

1. **Biometric data NEVER leaves the device** - All processing is local
2. **Only hashes are stored** - Irreversible cryptographic hashes only
3. **Multi-factor required** - 3+ independent entropy sources for critical actions
4. **Quantum-first** - All cryptography is post-quantum safe (Dilithium/Kyber)
5. **No custodial control** - Even developers cannot override user identity

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🤝 Contributing

This is a prototype demonstration. Contributions welcome for:
- Real biometric SDK integration
- Smart contract audits
- AI model improvements
- Metaverse platform integrations

---

## 📞 Support

For issues or questions:
-Admin : admin@omniflow.sbs
- GitHub Issues: [github.com/olukoyamartinspeace-coder/omni-flow/issues](https://github.com)
- Documentation: See `implementation_plan.md` and `walkthrough.md`
- BNB Chain Community: [https://www.bnbchain.org](https://www.bnbchain.org)

---

**Built with ❤️ for BNB Chain Hackathon 2026**



