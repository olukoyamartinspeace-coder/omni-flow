/**
 * sensor.js - Biometric Sensor Capture Layer
 * Captures touch, accelerometer, and orientation data.
 */

class BiometricSensor {
    constructor() {
        this.touchData = [];
        this.motionData = [];
        this.orientationData = [];
        this.isCapturing = false;

        this.handleTouch = this.handleTouch.bind(this);
        this.handleMotion = this.handleMotion.bind(this);
        this.handleOrientation = this.handleOrientation.bind(this);
    }

    startCapture() {
        if (this.isCapturing) return;
        this.isCapturing = true;
        this.touchData = [];
        this.motionData = [];
        this.orientationData = [];

        document.addEventListener('touchstart', this.handleTouch, { passive: false });
        document.addEventListener('touchmove', this.handleTouch, { passive: false });
        document.addEventListener('touchend', this.handleTouch, { passive: false });

        // Phase 2: High-fidelity polling fallback
        this._pollSensors();

        console.log("Biometric capture started (Phase 2 High-Fidelity)...");
    }

    _pollSensors() {
        if (!this.isCapturing) return;

        // requestAnimationFrame typically runs at 60Hz+
        requestAnimationFrame(() => {
            if (!this.isCapturing) return;
            this._pollSensors();
        });
    }

    stopCapture() {
        if (!this.isCapturing) return;
        this.isCapturing = false;

        document.removeEventListener('touchstart', this.handleTouch);
        document.removeEventListener('touchmove', this.handleTouch);
        document.removeEventListener('touchend', this.handleTouch);

        console.log("Biometric capture stopped.");
        return {
            touch: this.touchData,
            motion: this.motionData,
            orientation: this.orientationData
        };
    }

    handleTouch(e) {
        const touch = e.touches[0] || e.changedTouches[0];
        this.touchData.push({
            type: e.type,
            x: touch.clientX,
            y: touch.clientY,
            pressure: touch.force || 0,
            radiusX: touch.radiusX || 0,
            radiusY: touch.radiusY || 0,
            timestamp: Date.now()
        });
    }

    handleMotion(e) {
        this.motionData.push({
            accel: {
                x: e.acceleration.x,
                y: e.acceleration.y,
                z: e.acceleration.z
            },
            accelG: {
                x: e.accelerationIncludingGravity.x,
                y: e.accelerationIncludingGravity.y,
                z: e.accelerationIncludingGravity.z
            },
            rotation: {
                alpha: e.rotationRate.alpha,
                beta: e.rotationRate.beta,
                gamma: e.rotationRate.gamma
            },
            timestamp: Date.now()
        });
    }

    handleOrientation(e) {
        this.orientationData.push({
            alpha: e.alpha,
            beta: e.beta,
            gamma: e.gamma,
            timestamp: Date.now()
        });
    }

    getSampleCount() {
        return this.touchData.length;
    }
}

// Export for use in other modules
window.BiometricSensor = new BiometricSensor();
