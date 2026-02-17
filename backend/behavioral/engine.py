import numpy as np
import time

class BehavioralEngine:
    """
    Analyzes user behavior (keystroke dynamics) to generate a confidence score.
    
    Features:
    - Flight Time: Time between releasing a key and pressing the next.
    - Dwell Time: Time a key is held down.
    
    Privacy:
    - ONLY timing vectors are processed.
    - Actual characters typed are NOT stored or analyzed.
    """

    def __init__(self):
        # In-memory profile storage (Mock database)
        # Structure: { 'user_id': { 'dwell_mean': X, 'flight_mean': Y, ... } }
        self.profiles = {}
        self.learning_rate = 0.1

    def update_profile(self, user_id, timing_data):
        """
        Updates the user's behavioral profile with new data.
        timing_data = [ {'dwell': ms, 'flight': ms}, ... ]
        """
        if not timing_data:
            return False

        # Extract vectors
        dwells = [t['dwell'] for t in timing_data if 'dwell' in t]
        flights = [t['flight'] for t in timing_data if 'flight' in t]

        if not dwells or not flights:
            return False

        # Calculate current session stats
        current_dwell_mean = np.mean(dwells)
        current_flight_mean = np.mean(flights)

        # Retrieve or initialize profile
        if user_id not in self.profiles:
            self.profiles[user_id] = {
                'dwell_mean': current_dwell_mean,
                'flight_mean': current_flight_mean,
                'confidence': 0.5, # Start neutral
                'samples': 1
            }
        else:
            # Update rolling average
            p = self.profiles[user_id]
            p['dwell_mean'] = (p['dwell_mean'] * (1 - self.learning_rate)) + (current_dwell_mean * self.learning_rate)
            p['flight_mean'] = (p['flight_mean'] * (1 - self.learning_rate)) + (current_flight_mean * self.learning_rate)
            p['samples'] += 1
            
        return True

    def verify_user(self, user_id, timing_data):
        """
        Compares current session data against the stored profile.
        Returns confidence score (0.0 - 1.0).
        """
        if user_id not in self.profiles:
            return 0.5 # Unknown user, neutral score

        if not timing_data:
            return 0.5

        # Current session
        dwells = [t['dwell'] for t in timing_data]
        flights = [t['flight'] for t in timing_data]
        
        curr_d_mean = np.mean(dwells)
        curr_f_mean = np.mean(flights)
        
        # Profile
        prof = self.profiles[user_id]
        
        # Simple Euclidean distance measure (simplified for robustness)
        # Lower distance = Higher confidence
        
        dist_d = abs(curr_d_mean - prof['dwell_mean'])
        dist_f = abs(curr_f_mean - prof['flight_mean'])
        
        # Normalize distance (assuming standard deviation of ~50ms is common)
        avg_dev = (dist_d + dist_f) / 2
        
        # Map deviation to confidence
        # 0ms dev -> 100% conf
        # 100ms dev -> 0% conf
        confidence = max(0, 1 - (avg_dev / 100.0))
        
        return round(confidence, 2)
