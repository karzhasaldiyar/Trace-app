"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "trace-actor-name";
const EVENT_NAME = "trace-actor-name";

export default function ActorNameField({ name = "actorName" }: { name?: string }) {
  const [value, setValue] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) ?? "";
    setValue(stored);

    const handler = () => {
      const updated = localStorage.getItem(STORAGE_KEY) ?? "";
      setValue(updated);
    };

    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);

  return <input type="hidden" name={name} value={value} />;
}
