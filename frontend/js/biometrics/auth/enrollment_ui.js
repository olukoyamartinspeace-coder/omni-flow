/**
 * enrollment_ui.js - Biometric Enrollment UI Controller
 * Manages the capture pad and enrollment progress.
 */

class BiometricEnrollmentUI {
    constructor() {
        this.samplesRequired = 20;
        this.samplesCollected = 0;
        this.isTraining = false;

        this.containerId = 'biometric-enrollment-container';
        this.padId = 'biometric-capture-pad';
    }

    init() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        this.render();
        this.setupListeners();
    }

    render() {
        const container = document.getElementById(this.containerId);
        container.innerHTML = `
            <div class="biometric-card glassmorphism">
                <div class="card-header">
                    <h3>Biometric Identity Enrollment</h3>
                    <p>Phase 1: Touch Dynamics & Motion</p>
                </div>
                <div class="progress-container">
                    <div class="progress-bar" id="biometric-progress" style="width: 0%"></div>
                    <span id="biometric-stats">0 / ${this.samplesRequired} Samples</span>
                </div>
                
                <div id="${this.padId}" class="capture-pad">
                    <div class="pad-overlay">
                        <span class="pulse-icon">👆</span>
                        <p>Perform a swipe or tap pattern here</p>
                    </div>
                </div>

                <div id="enrollment-status" class="status-msg"></div>
                
                <div class="controls">
                    <button id="btn-reset-enrollment" class="btn-secondary">Reset</button>
                    <button id="btn-complete-enrollment" class="btn-primary" disabled>Finalize Identity</button>
                </div>
            </div>
        `;
    }

    setupListeners() {
        const pad = document.getElementById(this.padId);
        const resetBtn = document.getElementById('btn-reset-enrollment');
        const completeBtn = document.getElementById('btn-complete-enrollment');

        pad.addEventListener('touchstart', (e) => {
            e.preventDefault();
            window.BiometricSensor.startCapture();
            pad.classList.add('capturing');
        });

        pad.addEventListener('touchend', async (e) => {
            pad.classList.remove('capturing');
            const data = window.BiometricSensor.stopCapture();
            await this.processSample(data);
        });

        resetBtn.addEventListener('click', () => {
            this.samplesCollected = 0;
            this.updateProgress();
            document.getElementById('enrollment-status').innerText = "Enrollment reset.";
        });

        completeBtn.addEventListener('click', () => this.triggerTraining());
    }

    async processSample(data) {
        const features = window.BiometricExtractor.extractFeatures(data);
        if (!features) {
            this.showStatus("Invalid sample. Try a longer swipe.", "error");
            return;
        }

        const featureVector = window.BiometricExtractor.toFeatureVector(features);

        try {
            const response = await fetch('/api/enroll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    feature_vector: featureVector,
                    sample_type: 'touch_motion'
                })
            });

            if (response.ok) {
                this.samplesCollected++;
                this.updateProgress();
                this.showStatus(`Sample ${this.samplesCollected} stored successfully.`, "success");
            } else if (response.status === 403) {
                const err = await response.json();
                this.showStatus(`Anomaly detected (${err.anomaly_score}). Pattern too inconsistent.`, "error");
            } else if (response.status === 429) {
                this.showStatus("Rate limit exceeded. Slow down your captures.", "error");
            } else {
                this.showStatus("Failed to store sample on server.", "error");
            }
        } catch (e) {
            console.error("Enrollment error:", e);
            this.showStatus("Network error during enrollment.", "error");
        }
    }

    updateProgress() {
        const progress = (this.samplesCollected / this.samplesRequired) * 100;
        document.getElementById('biometric-progress').style.width = `${progress}%`;
        document.getElementById('biometric-stats').innerText = `${this.samplesCollected} / ${this.samplesRequired} Samples`;

        if (this.samplesCollected >= this.samplesRequired) {
            document.getElementById('btn-complete-enrollment').disabled = false;
        }
    }

    async triggerTraining() {
        this.showStatus("Training AI model... Please wait.", "info");
        try {
            const response = await fetch('/api/biometrics/train', { method: 'POST' });
            if (response.ok) {
                this.showStatus("Identity Model Trained & Synchronized.", "success");
                // Refresh local model
                await window.BiometricInference.loadModel();
            } else {
                this.showStatus("Training failed on server.", "error");
            }
        } catch (e) {
            this.showStatus("Error triggering training.", "error");
        }
    }

    showStatus(msg, type) {
        const statusEl = document.getElementById('enrollment-status');
        statusEl.innerText = msg;
        statusEl.className = `status-msg ${type}`;
    }
}

// Global instance
window.BiometricEnrollmentUI = new BiometricEnrollmentUI();
