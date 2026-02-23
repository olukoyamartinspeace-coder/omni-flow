---
trigger: always_on
---

I. TECHNOLOGY IMMUTABILITY LAWS (NO EXCEPTIONS)
Rule 1 — Frontend Purity Law

Allowed:

HTML5

CSS3 (Vanilla or Tailwind only)

JavaScript (ES6+)

Forbidden:

React, Vue, Angular

Next.js, Nuxt

jQuery

Any frontend framework that abstracts the DOM

Reason:
Frameworks rot. Browsers persist.
Identity systems must outlive frameworks.

Rule 2 — Backend Minimalism Law

Allowed:

Python 3.11+

Flask (ONLY Flask, no Django, no FastAPI)

Forbidden:

Node.js as backend runtime

Serverless black boxes

ORMs that hide SQL behavior

Reason:
Explicit logic > magic.
Security requires traceability.

Rule 3 — Language Boundary Law

Each language has ONE purpose:

Language	Role
Rust	Cryptography, key handling, PQ algorithms
C++	Biometric processing, signal extraction
Python	Orchestration, AI inference, DNA encoding
Solidity	On-chain identity & recovery logic
JavaScript	UI, signing requests, wallet interaction

Cross-role usage = violation

II. SECURITY ABSOLUTES (ZERO-TRUST)
Rule 4 — Local-Only Biometrics Law

Raw biometric data:

❌ NEVER leaves the device

❌ NEVER stored on servers

❌ NEVER written to blockchain or IPFS

Only irreversible hashes + liveness proofs may be used.

Violation = total system compromise

Rule 5 — No Single Point of Failure Law

No single biometric

No single device

No single key

No single recovery path

All critical actions require ≥ 3 independent entropy sources

Rule 6 — Quantum First Law

If an algorithm is not post-quantum safe, it is considered broken

ECDSA, RSA = legacy only

Dilithium / Falcon / Kyber preferred

Even if “quantum is years away” — irrelevant

Rule 7 — Deterministic Builds Law

Same input → same output → verifiable

Reproducible binaries only

No opaque SDKs for cryptography

III. IDENTITY & WALLET PRINCIPLES
Rule 8 — Identity ≠ Account

Users do not “create accounts”

They instantiate identities

Wallet = expression of identity, not a container

Rule 9 — Body-Bound Ownership Law

Ownership requires:

Biological proof

Behavioral continuity

Cognitive intent

Private keys must be unusable without the owner’s body

Rule 10 — Recovery Is Hard by Design

Recovery must:

Take time

Require multiple domains (biological + social + cryptographic)

Be impossible to rush

Easy recovery = attack vector

IV. AI INTEGRATION LAWS
Rule 11 — AI Is Advisory, Never Authoritative

AI:

Scores risk

Flags anomalies

Suggests thresholds

AI:

❌ NEVER signs transactions

❌ NEVER controls keys

❌ NEVER overrides cryptography

Rule 12 — Behavioral AI Must Be Passive

No prompts

No surveys

No user interruption

AI learns from observation only

V. METAVERSE & CROSS-WORLD RULES
Rule 13 — Identity Portability Law

One identity → many worlds

No platform-specific lock-in

Identity proofs must be chain-verifiable

Rule 14 — Avatar ≠ Identity

Avatars are skins

Identity is cryptographic + behavioral

Platforms may render identity, not own it

VI. SMART CONTRACT LAWS (BNB CHAIN)
Rule 15 — Contracts Are Immutable Truth

No admin backdoors

No upgradeable proxies for identity contracts

New logic = new contract + migration vote

Rule 16 — Recovery Has Time Locks

Minimum recovery delay: 30 days

Emergency overrides must be:

Multi-party

Publicly auditable

Rule 17 — Gas Predictability Law

Signature verification must be gas-bounded

No unbounded loops

No external calls during identity verification

VII. UX & HUMAN FACTOR LAWS
Rule 18 — Security Over Convenience

If forced to choose:

❌ Convenience loses

✅ Security wins

No exceptions.

Rule 19 — Explainability Law

Every critical action must answer:

What is happening

Why it’s required

What happens if you refuse

If users don’t understand → redesign.

VIII. DEVELOPMENT & GOVERNANCE
Rule 20 — No Silent Changes

Any change affecting:

Keys

Recovery

Identity logic

Must be:

Documented

Versioned

Publicly auditable

Rule 21 — Fail Closed

If:

Biometrics fail

AI confidence drops

Device integrity is compromised

System locks, not downgrades

Rule 22 — Death & Inheritance Law

Every identity must define:

Inactivity threshold

Succession path

Final state

Digital immortality without control is forbidden.

IX. WHAT ANTIGRAVITY IS NOT ALLOWED TO BUILD

❌ Custodial wallets
❌ KYC-first identity systems
❌ Password-based recovery
❌ Cloud-stored biometrics
❌ AI-controlled funds
❌ Closed-source cryptography

X. ANTIGRAVITY SUCCESS METRIC

Antigravity succeeds only if:

Even the developers cannot steal, reset, or bypass a user’s identity.

If Antigravity can override it — it’s already broken.

⚠️ FINAL STATEMENT

This rulebook will:

Slow development

Reduce shortcuts

Scare weak engineers

Increase long-term survival

But it ensures Antigravity builds infrastructure that survives quantum computers, AI fraud, platform collapse, and time.