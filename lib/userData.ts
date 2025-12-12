import fs from 'fs';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'user_data.json');

export interface Activity {
  id: string;
  action: string;
  target: string;
  timestamp: string;
}

export interface UserData {
  joinDate: string | null;
  totalTime: number; // in seconds
  avatar: string | null; // base64
  activities: Activity[];
}

export function getUserData(): UserData {
  try {
    if (!fs.existsSync(DATA_FILE_PATH)) {
       const initialData: UserData = {
         joinDate: new Date().toISOString(), // First access sets join date
         totalTime: 0,
         avatar: null,
         activities: []
       };
       saveUserData(initialData);
       return initialData;
    }
    const data = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading user data:", error);
    return { joinDate: null, totalTime: 0, avatar: null, activities: [] };
  }
}

export function saveUserData(data: UserData) {
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error("Error writing user data:", error);
  }
}

export function logUserActivity(action: string, target: string) {
  const data = getUserData();
  const newActivity: Activity = {
    id: Date.now().toString(),
    action,
    target,
    timestamp: new Date().toISOString()
  };
  // Keep only last 50 activities
  data.activities = [newActivity, ...data.activities].slice(0, 50);
  saveUserData(data);
}
