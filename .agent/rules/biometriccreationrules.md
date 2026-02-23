---
trigger: always_on
---

1️⃣ Architecture Rules
Rule 1: Frontend and Backend Must Be Strictly Separated

JavaScript handles:

UI

Sensor capture

Local inference (TensorFlow.js)

Python Flask handles:

Model training

Model validation

Fusion logic

Credential storage

❌ No ML training in the browser
❌ No raw biometric processing in Flask without encryption

Rule 2: Raw Biometric Data Must Never Be Stored

Allowed:

Feature vectors

Embeddings

Encrypted hashes

Never allowed:

Raw iris images

Raw touch logs

Raw motion recordings

If raw data is used for training:

It must be deleted after model generation.

Rule 3: Every Biometric Must Produce a Score (Not Boolean)

Authentication response format:

{
  "confidence": 0.87,
  "liveness": 0.92,
  "model_version": "1.0.3"
}


❌ Never return true/false only.

2️⃣ Machine Learning Rules
Rule 4: Start Simple Before Complex

Order of models:

MLP (baseline)

LSTM (sequence modeling)

CNN (for images)

Fusion model

No jumping directly to complex architectures.

Rule 5: Model Must Be Versioned

Each deployed model must include:

model_name
model_version
accuracy
date_trained
training_dataset_hash


Rollback capability required.

Rule 6: Model Must Be Convertible to TensorFlow.js

Training happens in Python.
Deployment inference happens in JavaScript.

Mandatory conversion pipeline:

Keras → SavedModel → TFJS format


No model goes live without successful browser test.

Rule 7: Threshold Must Be Adjustable

Never hardcode authentication threshold.

Must allow:

low_risk_threshold
high_risk_threshold
adaptive_threshold

3️⃣ Security Rules
Rule 8: No Biometric Unlocks Directly

Biometric output must not unlock assets directly.

Correct flow:

Biometric → Confidence Score → Session Token → Cryptographic Signing


Biometric never equals private key.

Rule 9: All API Calls Must Be Signed

Frontend must:

Include JWT

Include timestamp

Include nonce

Backend must:

Validate signature

Prevent replay

Rule 10: Fail Secure

If:

Sensor unavailable

Model missing

Confidence low

Liveness failed

System must:

Deny Access
OR
Require Fallback MFA


Never auto-approve.

4️⃣ Data Engineering Rules
Rule 11: Minimum Dataset Per User

Enrollment must collect:

At least 20 samples (touch)

At least 5 sessions

Different time intervals

No single-session enrollment.

Rule 12: Normalize Before Training

All features must be:

scaled
standardized
validated


Never train on raw scale data.

Rule 13: Detect Outliers

During training:

Remove anomalies

Remove corrupted sessions

Log rejected samples

5️⃣ Fusion Rules (Future Multimodal)
Rule 14: Modalities Must Work Independently

Touch must authenticate alone.
Iris must authenticate alone.
Fusion enhances — never blocks baseline.

Rule 15: Fusion Must Be Deterministic

Example:

Final Score =
(Touch × 0.5) +
(Iris × 0.3) +
(Vein × 0.2)


Weights must be documented and auditable.

6️⃣ Performance Rules
Rule 16: Inference Time < 200ms

Browser inference must feel instant.

If model > 5MB → optimize.

Rule 17: API Latency < 100ms

Authentication must not feel slow.

7️⃣ Code Quality Rules
Rule 18: TypeScript Required on Frontend

Because:

WebAuthn structures are complex

ML inputs must match shape exactly

Type safety prevents production errors

Rule 19: Modular Folder Structure Required

Frontend:

/capture
/features
/ml
/auth
/utils


Backend:

/routes
/models
/training
/fusion
/security

Rule 20: No Hardcoded Secrets

Use environment variables

Never commit private keys

Never commit model secrets

8️⃣ Ethical & Legal Rules
Rule 21: Explicit Consent Required

Before enrollment:

User must accept biometric usage policy

Must allow deletion request

Rule 22: User Can Delete Biometric Template

Deletion must:

Remove embeddings

Remove model data tied to user

Log deletion event

9️⃣ Development Discipline Rules
Rule 23: Build in Phases

Phase 1 → Touch Only
Phase 2 → Model Hardening
Phase 3 → Iris
Phase 4 → Finger Vein
Phase 5 → Fusion

No skipping phases.

Rule 24: Every Feature Must Be Measurable

Track:

FAR (False Acceptance Rate)

FRR (False Rejection Rate)

EER (Equal Error Rate)

Model accuracy

If not measurable → not deployable.

🔒 Final Engineering Law of Antigravity

No biometric feature enters production
unless it is measurable, versioned, encrypted, and reversible.