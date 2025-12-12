"use client";

import { useEffect } from "react";

export function TimeTracker() {
  useEffect(() => {
    const INTERVAL = 30000; // 30 seconds
    
    const tick = () => {
      if (document.visibilityState === "visible") {
         fetch("/api/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "add_time", seconds: 30 }),
        }).catch(e => console.error("Time tracking error", e));
      }
    };

    const intervalId = setInterval(tick, INTERVAL);

    return () => clearInterval(intervalId);
  }, []);

  return null;
}
