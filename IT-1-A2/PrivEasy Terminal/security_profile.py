import os
import json
import base64
from hashlib import pbkdf2_hmac


class ProfileManager:
    PROFILE_FILE = os.path.expanduser("~/.priveasy_profile.json")
    ITERATIONS = 100_000
    SALT_SIZE = 16

    def __init__(self):
        self.profile_data = None
        self.session_key = None
        
        if os.path.exists(self.PROFILE_FILE):
            try:
                if os.path.getsize(self.PROFILE_FILE) > 0:
                    with open(self.PROFILE_FILE, "r") as f:
                        self.profile_data = json.load(f)
                else:
                    self.profile_data = None
            except (json.JSONDecodeError, ValueError):
                self.profile_data = None

    def is_profile_created(self) -> bool:
        return self.profile_data is not None

    def create_profile(self, password: str):
        salt = os.urandom(self.SALT_SIZE)
        key = pbkdf2_hmac("sha256", password.encode(), salt, self.ITERATIONS)

        profile = {
            "salt": base64.b64encode(salt).decode(),
            "key": base64.b64encode(key).decode(),
        }

        with open(self.PROFILE_FILE, "w") as f:
            json.dump(profile, f)

        self.profile_data = profile
        self.session_key = key
        
        return True

    def verify_password(self, password: str) -> bool:
        if not self.profile_data:
            return False

        salt = base64.b64decode(self.profile_data["salt"])
        stored_key = base64.b64decode(self.profile_data["key"])

        test_key = pbkdf2_hmac("sha256", password.encode(), salt, self.ITERATIONS)
        if test_key == stored_key:
            self.session_key = test_key
            return True
        
        self.session_key = None
        return False

    def change_password(self, new_password: str):
        salt = os.urandom(self.SALT_SIZE)
        key = pbkdf2_hmac("sha256", new_password.encode(), salt, self.ITERATIONS)
        
        profile = {
            "salt": base64.b64encode(salt).decode(),
            "key": base64.b64encode(key).decode(),
        }

        with open(self.PROFILE_FILE, "w") as f:
            json.dump(profile, f)
            
        self.profile_data = profile
        self.session_key = key
        
        return True

    def clear_session(self):
        self.session_key = None