/**
 * inference.js - Biometric Local ML Inference
 * Loads and runs the TFJS model for local scoring.
 */

class BiometricInference {
    constructor() {
        this.model = null;
        this.modelPath = '/models/touch-model.json';
        this.threshold = 0.8; // Configurable per Rule 7
    }

    async loadModel() {
        try {
            // Check if tf is available (should be included in index.html)
            if (typeof tf === 'undefined') {
                console.error("TensorFlow.js not found. Load the script first.");
                return false;
            }

            this.model = await tf.loadLayersModel(this.modelPath);
            console.log("Biometric model loaded successfully.");
            return true;
        } catch (e) {
            console.warn("Failed to load local model. Falling back to server-side or enrollment mode.", e);
            return false;
        }
    }

    async predict(featureVector) {
        if (!this.model) {
            const loaded = await this.loadModel();
            if (!loaded) return { confidence: 0, error: "Model not loaded" };
        }

        const inputTensor = tf.tensor2d([featureVector]);
        const prediction = this.model.predict(inputTensor);
        const score = (await prediction.data())[0];

        // Clean up tensors to prevent memory leaks
        inputTensor.dispose();
        prediction.dispose();

        return {
            confidence: score,
            liveness: 1.0, // Placeholder for Phase 2
            model_version: "1.0.0",
            authenticated: score >= this.threshold
        };
    }

    setThreshold(newThreshold) {
        this.threshold = newThreshold;
    }
}

// Export for use in other modules
window.BiometricInference = new BiometricInference();
