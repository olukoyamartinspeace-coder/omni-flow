import datetime

class DeadManSwitch:
    """
    Automated recovery protocol.
    If the user does not 'check in' within the threshold,
    the recovery process is initiated (e.g., releasing keys to social guardians).
    """

    def __init__(self):
        # In-memory store: user_id -> last_active_timestamp
        self.last_active = {}
        self.thresholds = {} # user_id -> days

    def check_in(self, user_id):
        self.last_active[user_id] = datetime.datetime.now()
        if user_id not in self.thresholds:
            self.thresholds[user_id] = 30 # Default 30 days
        return {
            "status": "active",
            "last_check_in": self.last_active[user_id].isoformat(),
            "days_until_trigger": self.thresholds[user_id]
        }

    def set_threshold(self, user_id, days):
        self.thresholds[user_id] = days
        # checking in when setting threshold
        self.check_in(user_id) 
        return True

    def simulate_lapse(self, user_id, days_lapsed):
        """
        Debug function to simulate time passing.
        """
        if user_id not in self.last_active:
            self.check_in(user_id)
            
        # artificially move last_active back
        self.last_active[user_id] = datetime.datetime.now() - datetime.timedelta(days=days_lapsed)
        
        return self.get_status(user_id)

    def get_status(self, user_id):
        if user_id not in self.last_active:
            return {"status": "inactive", "message": "User not initialized"}
            
        elapsed = datetime.datetime.now() - self.last_active[user_id]
        threshold = datetime.timedelta(days=self.thresholds.get(user_id, 30))
        
        if elapsed > threshold:
            return {
                "status": "triggered",
                "message": "EMERGENCY PROTOCOL INITIATED. KEYS RELEASED TO GUARDIANS.",
                "triggered_at": (self.last_active[user_id] + threshold).isoformat()
            }
        else:
             return {
                "status": "active",
                "days_remaining": (threshold - elapsed).days
            }
