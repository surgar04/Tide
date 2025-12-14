import json
import os
from datetime import datetime
from backend.models import UserData, Activity

# Assuming running from root or backend, adjust path accordingly
# In Next.js it was path.join(process.cwd(), 'data', 'user_data.json')
# We'll assume the backend is run from project root or handle relative path.
# Let's fix path to be relative to the backend execution or absolute.

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_FILE_PATH = os.path.join(BASE_DIR, 'data', 'user_data.json')

def get_user_data() -> UserData:
    try:
        if not os.path.exists(DATA_FILE_PATH):
            initial_data = UserData(
                joinDate=datetime.now().isoformat()
            )
            save_user_data(initial_data)
            return initial_data
        
        with open(DATA_FILE_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return UserData(**data)
    except Exception as e:
        print(f"Error reading user data: {e}")
        return UserData(joinDate=None)

def save_user_data(data: UserData):
    try:
        os.makedirs(os.path.dirname(DATA_FILE_PATH), exist_ok=True)
        with open(DATA_FILE_PATH, 'w', encoding='utf-8') as f:
            f.write(data.model_dump_json(indent=2))
    except Exception as e:
        print(f"Error writing user data: {e}")

def log_user_activity(action: str, target: str):
    data = get_user_data()
    new_activity = Activity(
        id=str(int(datetime.now().timestamp() * 1000)),
        action=action,
        target=target,
        timestamp=datetime.now().isoformat()
    )
    # Keep only last 50 activities
    data.activities = [new_activity] + data.activities
    data.activities = data.activities[:50]
    save_user_data(data)
