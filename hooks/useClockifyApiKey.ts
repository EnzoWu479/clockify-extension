"use client";

import { useEffect, useState } from "react";

export function useClockifyApiKey() {
  const [apiKey, setApiKey] = useState("");
  const [isKeyActive, setIsKeyActive] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedKey = window.localStorage.getItem("clockifyApiKey") ?? "";
    if (storedKey) {
      setApiKey(storedKey);
      setIsKeyActive(true);
    }
  }, []);

  const hasKey = isKeyActive && apiKey.trim().length > 0;

  function activateKey() {
    const trimmed = apiKey.trim();
    setIsKeyActive(trimmed.length > 0);
    if (trimmed && typeof window !== "undefined") {
      window.localStorage.setItem("clockifyApiKey", trimmed);
    }
  }

  function clearKey() {
    setApiKey("");
    setIsKeyActive(false);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("clockifyApiKey");
    }
  }

  return {
    apiKey,
    setApiKey,
    isKeyActive,
    hasKey,
    activateKey,
    clearKey,
  };
}
