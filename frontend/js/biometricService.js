/**
 * BiometricService
 * Handles face detection and biometric enrollment using MediaPipe.
 */
class BiometricService {
    constructor() {
        this.detector = null;
        this.camera = null;
        this.videoElement = null;
        this.canvasElement = null;
        this.isInitialized = false;
        this.STORAGE_KEY = 'omniflow_biometric_data';
    }

    /**
     * Initialize MediaPipe Face Detection
     */
    async init(videoElement, canvasElement) {
        if (this.isInitialized) return;

        this.videoElement = videoElement;
        this.canvasElement = canvasElement;

        try {
            // Check for available global (TFJS model wrapper)
            const faceDetection = window.faceDetection || window.face_detection;
            if (!faceDetection) {
                console.error('Available globals:', Object.keys(window).filter(k => k.toLowerCase().includes('face')));
                throw new Error('Face Detection library not loaded. Ensure you are connected to the internet.');
            }

            // Dynamically resolve SupportedModels to avoid "undefined" or unsupported names
            let modelName = 'MediaPipeFaceDetection';
            if (faceDetection.SupportedModels) {
                // Return the first available model that looks like what we want
                const keys = Object.keys(faceDetection.SupportedModels);
                console.log('Available models:', keys);

                if (faceDetection.SupportedModels.MediaPipeFaceDetection) {
                    modelName = faceDetection.SupportedModels.MediaPipeFaceDetection;
                } else if (keys.length > 0) {
                    modelName = faceDetection.SupportedModels[keys[0]];
                }
            }

            console.log('Attempting to initialize detector with model:', modelName);

            const detectorConfig = {
                runtime: 'tfjs',
                maxFaces: 1,
                refineLandmarks: false
            };

            this.detector = await faceDetection.createDetector(modelName, detectorConfig);
            this.isInitialized = true;
            console.log('BiometricService Initialized');
        } catch (error) {
            console.error('Failed to initialize Face Detection:', error);
            throw error;
        }
    }

    /**
     * Start the camera
     */
    async startCamera() {
        if (!this.videoElement) return;

        try {
            // Relaxed constraints for better compatibility on Windows/Desktop
            const constraints = {
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                },
                audio: false
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.videoElement.srcObject = stream;

            // Wait for video metadata to load
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error('Camera initialization timed out')), 5000);
                this.videoElement.onloadedmetadata = () => {
                    clearTimeout(timeout);
                    this.videoElement.play().then(resolve).catch(reject);
                };
            });

            // Ensure canvas matches video size
            if (this.canvasElement) {
                this.canvasElement.width = this.videoElement.videoWidth || 640;
                this.canvasElement.height = this.videoElement.videoHeight || 480;
            }
        } catch (error) {
            let userMessage = 'Camera access denied';
            if (error.name === 'NotAllowedError') userMessage = 'Permission denied. Please allow camera access in your browser.';
            else if (error.name === 'NotFoundError') userMessage = 'No camera found on this device.';
            else if (error.name === 'NotReadableError') userMessage = 'Camera is already in use by another application.';
            else if (error.message.includes('timeout')) userMessage = 'Camera timed out. Please refresh and try again.';

            console.error('Camera Error:', error);
            throw new Error(userMessage);
        }
    }

    /**
     * Stop the camera
     */
    stopCamera() {
        if (this.videoElement && this.videoElement.srcObject) {
            const tracks = this.videoElement.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            this.videoElement.srcObject = null;
        }
    }

    /**
     * Detect faces in the current video frame
     */
    async detectFaces() {
        if (!this.detector || !this.videoElement || this.videoElement.readyState < 2) return [];

        try {
            const faces = await this.detector.estimateFaces(this.videoElement, {
                flipHorizontal: false,
                staticImageMode: false
            });
            return faces;
        } catch (e) {
            console.warn('Detection skipped:', e);
            return [];
        }
    }

    /**
     * Process capture and generate embedding
     */
    async processCapture(userId) {
        const faces = await this.detectFaces();
        if (faces.length === 0) throw new Error('No face detected');

        const face = faces[0];
        const quality = this.calculateQuality(face);

        console.log(`Face detected. Quality score: ${quality.toFixed(2)}`);

        if (quality < 0.4) {
            throw new Error(`Image quality too low (${(quality * 100).toFixed(0)}%). Please center your face and ensure good lighting.`);
        }

        // For demo: Generate a deterministic embedding based on userId and face box
        // In production: use a proper facial recognition model (e.g., FaceNet)
        const embedding = this.generateDemoEmbedding(userId, face);

        const biometricData = {
            userId,
            embedding,
            quality,
            timestamp: Date.now()
        };

        this.saveBiometricData(userId, biometricData);
        return biometricData;
    }

    /**
     * Calculate quality score based on face size and position
     */
    calculateQuality(face) {
        const { box } = face;
        const videoWidth = this.videoElement.videoWidth;
        const videoHeight = this.videoElement.videoHeight;

        // Size quality: Face should take up ~5-30% of the screen (Relaxed from 15%)
        const faceArea = box.width * box.height;
        const screenArea = videoWidth * videoHeight;
        const sizeRatio = faceArea / screenArea;
        const sizeQuality = Math.min(sizeRatio / 0.05, 1.0);

        // Centering quality
        const centerX = box.xMin + box.width / 2;
        const centerY = box.yMin + box.height / 2;
        const distFromCenter = Math.sqrt(
            Math.pow((centerX - videoWidth / 2) / (videoWidth / 2), 2) +
            Math.pow((centerY - videoHeight / 2) / (videoHeight / 2), 2)
        );
        const centerQuality = Math.max(0, 1 - distFromCenter);

        // Weighted score: 50% size, 50% centering
        return (sizeQuality * 0.5 + centerQuality * 0.5);
    }

    /**
     * Generate a demo embedding (Simulated)
     */
    generateDemoEmbedding(userId, face) {
        // Create a 128-dim vector
        const embedding = [];
        const seed = userId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        for (let i = 0; i < 128; i++) {
            embedding.push(Math.sin(seed + i * 0.1) * 0.5 + 0.5);
        }
        return embedding;
    }

    /**
     * Save biometric data to local storage (Simulated encryption)
     */
    saveBiometricData(userId, data) {
        const existingData = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
        existingData[userId] = data;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingData));
    }

    /**
     * Verify face against stored embedding
     */
    async verifyFace(userId) {
        const existingData = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
        const stored = existingData[userId];
        if (!stored) return false;

        const currentData = await this.processCapture(userId);
        const similarity = this.cosineSimilarity(stored.embedding, currentData.embedding);

        return similarity > 0.85;
    }

    /**
     * Cosine Similarity calculation
     */
    cosineSimilarity(vecA, vecB) {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}

window.biometricService = new BiometricService();
