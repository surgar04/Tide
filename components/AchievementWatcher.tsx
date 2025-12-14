"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { ACHIEVEMENTS, Achievement } from "@/lib/achievements";
import { AchievementToast } from "@/components/ui/AchievementToast";
import { userClient } from "@/lib/data/userClient";

export function AchievementWatcher() {
    const { user } = useAuth();
    const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
    const [stats, setStats] = useState({ uploadCount: 0, projectCount: 0 });

    useEffect(() => {
        if (!user) return;

        // Fetch stats needed for achievement calculation
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/github/resources?type=all");
                const data = await res.json();
                const uploads = data.resources?.length || 0;

                const res2 = await fetch("/api/github/resources?type=projects");
                const data2 = await res2.json();
                const projects = data2.projects?.length || 0;

                setStats({ uploadCount: uploads, projectCount: projects });
            } catch (e) {
                console.error("Failed to fetch achievement stats", e);
            }
        };

        fetchStats();
    }, [user]);

    useEffect(() => {
        if (!user) return;

        const checkAchievements = async () => {
            // Get latest user data
            let userData;
            try {
                userData = await userClient.getUserData();
            } catch (e) {
                return;
            }

            // Get previously unlocked IDs from local storage
            const stored = localStorage.getItem(`tideoa_achievements_${user.email}`);
            const unlockedIds = stored ? JSON.parse(stored) : [];

            // Check for newly unlocked achievements
            const newUnlocks: string[] = [];
            
            for (const achievement of ACHIEVEMENTS) {
                if (unlockedIds.includes(achievement.id)) continue;

                if (achievement.condition(userData, stats.uploadCount, stats.projectCount)) {
                    newUnlocks.push(achievement.id);
                    // Show notification (queueing could be implemented, but simple replacement is fine for now)
                    setCurrentAchievement(achievement);
                    // Save immediately to prevent duplicate notifications
                    const newStored = [...unlockedIds, ...newUnlocks];
                    localStorage.setItem(`tideoa_achievements_${user.email}`, JSON.stringify(newStored));
                    break; // Only show one at a time per check cycle to avoid spam
                }
            }
        };

        const interval = setInterval(checkAchievements, 10000); // Check every 10 seconds
        checkAchievements(); // Initial check

        return () => clearInterval(interval);
    }, [user, stats]);

    return (
        <AchievementToast 
            achievement={currentAchievement} 
            onClose={() => setCurrentAchievement(null)} 
        />
    );
}
