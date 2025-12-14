export interface Activity {
    id: string;
    action: string;
    target: string;
    timestamp: string;
}

export interface UserData {
    username?: string;
    email?: string;
    joinDate: string | null;
    totalTime: number; // in seconds
    avatar: string | null; // base64
    signature?: string;
    activities: Activity[];
}

const API_BASE_URL = "http://localhost:8000/api";

export const userClient = {
    async getUserData(): Promise<UserData> {
        const res = await fetch(`${API_BASE_URL}/user`);
        if (!res.ok) throw new Error("Failed to fetch user data");
        return res.json();
    },

    async saveUserData(data: UserData): Promise<void> {
        // Map to update_profile for simplicity
        await fetch(`${API_BASE_URL}/user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                type: "update_profile",
                username: data.username,
                email: data.email,
                avatar: data.avatar,
            })
        });

        if (data.signature) {
             await this.updateSignature(data.signature);
        }
    },

    async updateSignature(signature: string): Promise<void> {
        await fetch(`${API_BASE_URL}/user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                type: "update_signature",
                signature
            })
        });
    },

    async updateAvatar(avatar: string): Promise<void> {
        await fetch(`${API_BASE_URL}/user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                type: "update_avatar",
                avatar
            })
        });
    },

    async logActivity(action: string, target: string): Promise<void> {
        // Backend handles logging automatically on actions, 
        // but if we need manual logging:
        // await fetch(`${API_BASE_URL}/activity`, ...);
        console.log("Web: Activity logging skipped (handled by server or not implemented)");
    },
    
    async addTime(seconds: number): Promise<void> {
            await fetch(`${API_BASE_URL}/user`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                type: "add_time",
                seconds
            })
        });
    }
};
