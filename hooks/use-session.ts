"use client";

import { useEffect, useRef, useCallback } from "react";
import { useUser } from "./use-user";
import { getDeviceInfo, getPlatform, getSessionId } from "@/lib/session-utils";

export function useSession() {
  const { user } = useUser();
  const sessionEnded = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  const saveSession = useCallback(async (userId?: string) => {
    try {
      const sessionId = getSessionId();
      const device = getDeviceInfo();
      const platform = getPlatform();

      await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          device,
          platform,
          userId: userId || null,
        }),
      });
    } catch (error) {
      console.error("Failed to save session:", error);
    }
  }, []);

  const endSession = useCallback(async () => {
    if (sessionEnded.current) return;

    sessionEnded.current = true;
    try {
      const sessionId = localStorage.getItem("session_id");
      if (sessionId) {
        await fetch("/api/sessions", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
      }
    } catch (error) {
      console.error("Failed to end session:", error);
    }
  }, []);

  useEffect(() => {
    console.log("useSession hook mounted - creating session"); // Debug log
    saveSession(user?.id);

    intervalRef.current = setInterval(() => {
      saveSession(user?.id);
    }, 30000);

    window.addEventListener("beforeunload", endSession);
    window.addEventListener("popstate", () => saveSession(user?.id));

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener("beforeunload", endSession);
      window.removeEventListener("popstate", () => saveSession(user?.id));
      endSession();
    };
  }, [user?.id, saveSession, endSession]);

  return { saveSession, endSession };
}