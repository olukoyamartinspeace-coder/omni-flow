/**
 * extractor.js - Biometric Feature Extraction
 * Converts raw sensor data into feature vectors.
 */

class BiometricExtractor {
    extractFeatures(data) {
        const { touch, motion, orientation } = data;

        if (touch.length < 2) return null;

        const features = {};

        // 1. Touch Dynamics
        const swipes = this.splitIntoSwipes(touch);
        features.swipeCount = swipes.length;

        if (swipes.length > 0) {
            const averageSwipe = this.calculateAverageSwipeMetrics(swipes);
            features.avgVelocity = averageSwipe.velocity;
            features.avgAcceleration = averageSwipe.acceleration;
            features.avgJerk = averageSwipe.jerk;
            features.avgPressure = averageSwipe.pressure;
            features.avgDuration = averageSwipe.duration;
        } else {
            features.avgVelocity = 0;
            features.avgAcceleration = 0;
            features.avgJerk = 0;
            features.avgPressure = 0;
            features.avgDuration = 0;
        }

        // 2. Motion Patterns
        if (motion.length > 0) {
            const motionMetrics = this.calculateMotionMetrics(motion);
            features.motionIntensity = motionMetrics.intensity;
            features.avgStability = motionMetrics.stability;
        } else {
            features.motionIntensity = 0;
            features.avgStability = 0;
        }

        // 3. Timing Patterns
        features.tapInterval = this.calculateAverageInterval(touch);

        return features;
    }

    splitIntoSwipes(touchData) {
        const swipes = [];
        let currentSwipe = [];

        touchData.forEach(point => {
            if (point.type === 'touchstart') {
                currentSwipe = [point];
            } else if (point.type === 'touchmove') {
                currentSwipe.push(point);
            } else if (point.type === 'touchend') {
                currentSwipe.push(point);
                if (currentSwipe.length > 2) swipes.push(currentSwipe);
                currentSwipe = [];
            }
        });

        return swipes;
    }

    calculateAverageSwipeMetrics(swipes) {
        let totalVel = 0, totalAcc = 0, totalJerk = 0, totalPress = 0, totalDur = 0;

        swipes.forEach(swipe => {
            const duration = swipe[swipe.length - 1].timestamp - swipe[0].timestamp;
            const distance = Math.sqrt(
                Math.pow(swipe[swipe.length - 1].x - swipe[0].x, 2) +
                Math.pow(swipe[swipe.length - 1].y - swipe[0].y, 2)
            );

            const velocity = distance / (duration || 1);
            const acceleration = velocity / (duration || 1);
            const jerk = acceleration / (duration || 1);
            const pressure = swipe.reduce((sum, p) => sum + p.pressure, 0) / swipe.length;

            totalVel += velocity;
            totalAcc += acceleration;
            totalJerk += jerk;
            totalPress += pressure;
            totalDur += duration;
        });

        return {
            velocity: totalVel / swipes.length,
            acceleration: totalAcc / swipes.length,
            jerk: totalJerk / swipes.length,
            pressure: totalPress / swipes.length,
            duration: totalDur / swipes.length
        };
    }

    calculateMotionMetrics(motionData) {
        let intensity = 0;
        let stability = 0;

        motionData.forEach(m => {
            const mag = Math.sqrt(
                Math.pow(m.accel.x || 0, 2) +
                Math.pow(m.accel.y || 0, 2) +
                Math.pow(m.accel.z || 0, 2)
            );
            intensity += mag;

            const rotMag = Math.sqrt(
                Math.pow(m.rotation.alpha || 0, 2) +
                Math.pow(m.rotation.beta || 0, 2) +
                Math.pow(m.rotation.gamma || 0, 2)
            );
            stability += rotMag;
        });

        return {
            intensity: intensity / motionData.length,
            stability: stability / motionData.length
        };
    }

    calculateAverageInterval(touchData) {
        const starts = touchData.filter(p => p.type === 'touchstart');
        if (starts.length < 2) return 0;

        let totalInterval = 0;
        for (let i = 1; i < starts.length; i++) {
            totalInterval += starts[i].timestamp - starts[i - 1].timestamp;
        }

        return totalInterval / (starts.length - 1);
    }

    toFeatureVector(features) {
        // Deterministic ordering for ML
        return [
            features.swipeCount || 0,
            features.avgVelocity || 0,
            features.avgAcceleration || 0,
            features.avgJerk || 0,
            features.avgPressure || 0,
            features.avgDuration || 0,
            features.motionIntensity || 0,
            features.avgStability || 0,
            features.tapInterval || 0
        ];
    }
}

// Export for use in other modules
window.BiometricExtractor = new BiometricExtractor();
