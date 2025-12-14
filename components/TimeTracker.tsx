"use client";

import { useEffect } from "react";
import { userClient } from "@/lib/data/userClient";

export function TimeTracker() {
  useEffect(() => {
    const INTERVAL = 30000; // 30 seconds
    
    const tick = () => {
      if (document.visibilityState === "visible") {
         userClient.addTime(30).catch(e => console.error("Time tracking error", e));
      }
    };

    const intervalId = setInterval(tick, INTERVAL);

    return () => clearInterval(intervalId);
  }, []);

  return null;
}
