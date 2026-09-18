"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;

    let registration: ServiceWorkerRegistration | null = null;
    const checkForUpdate = () => { void registration?.update(); };

    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((value) => { registration = value; })
      .catch(() => undefined);

    const updateTimer = window.setInterval(checkForUpdate, 60 * 60 * 1000);
    document.addEventListener("visibilitychange", checkForUpdate);
    return () => {
      window.clearInterval(updateTimer);
      document.removeEventListener("visibilitychange", checkForUpdate);
    };
  }, []);

  return null;
}
