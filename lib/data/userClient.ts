import { core } from "@tauri-apps/api";

const isTauri = () => {
    return typeof window !== "undefined" && "__TAURI__" in window;
};

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

// Client-side implementation that switches between API and Tauri
export const userClient = {
    async getUserData(): Promise<UserData> {
        if (isTauri()) {
            try {
                const data = await core.invoke<UserData>("get_user_data");
                return data;
            } catch (error) {
                console.error("Tauri: Failed to get user data", error);
                throw error;
            }
        } else {
            // Web fallback
            const res = await fetch("/api/user");
            if (!res.ok) throw new Error("Failed to fetch user data");
            return res.json();
        }
    },

    async saveUserData(data: UserData): Promise<void> {
        if (isTauri()) {
            try {
                await core.invoke("save_user_data", { data });
            } catch (error) {
                console.error("Tauri: Failed to save user data", error);
                throw error;
            }
        } else {
            // For Web, we send specific updates based on what changed, or generic update
            // But API expects specific "type" field. 
            // We need to adapt the full object save to the API's "action" based logic or update API to accept full object.
            // For simplicity in this migration, let's assume we map basic fields.
            // Ideally, we should unify the API to accept a full object update or similar structure.
            
            // However, the existing API uses "type" to determine action.
            // Let's try to map best effort or update API. 
            // Updating API is better but user asked to migrate logic to Client/Tauri.
            // Let's just handle the "profile update" case which covers most fields.
            
            await fetch("/api/user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "update_profile",
                    username: data.username,
                    email: data.email,
                    avatar: data.avatar,
                    // Signature is handled separately in current API but we can bundle it if we modify API
                })
            });

            if (data.signature) {
                 await fetch("/api/user", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: "update_signature",
                        signature: data.signature
                    })
                });
            }
        }
    },

    async updateSignature(signature: string): Promise<void> {
        if (isTauri()) {
            const data = await this.getUserData();
            data.signature = signature;
            await this.saveUserData(data);
        } else {
            await fetch("/api/user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "update_signature",
                    signature
                })
            });
        }
    },

    async updateAvatar(avatar: string): Promise<void> {
         if (isTauri()) {
            const data = await this.getUserData();
            data.avatar = avatar;
            await this.saveUserData(data);
            await this.logActivity("更新头像 | Updated Avatar", "个人设置");
        } else {
            await fetch("/api/user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "update_avatar",
                    avatar
                })
            });
        }
    },

    async logActivity(action: string, target: string): Promise<void> {
        if (isTauri()) {
            try {
                await core.invoke("log_activity", { action, target });
            } catch (error) {
                console.error("Tauri: Failed to log activity", error);
            }
        } else {
            // The Web API logs activity automatically on actions, 
            // but if we need manual logging (like from client side actions that don't hit API main endpoints)
            // we might need a dedicated log endpoint or just rely on the action endpoints.
            // The current /api/user does logging internally.
            // If we have a standalone log requirement:
            // fetch("/api/log", ...) // doesn't exist yet.
            console.log("Web: Activity logging skipped (handled by server or not implemented)");
        }
    },
    
    async addTime(seconds: number): Promise<void> {
        if (isTauri()) {
            const data = await this.getUserData();
            data.totalTime += seconds;
            await this.saveUserData(data);
        } else {
             await fetch("/api/user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "add_time",
                    seconds
                })
            });
        }
    }
};
