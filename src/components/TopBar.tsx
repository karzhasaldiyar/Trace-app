"use client";

import { useState } from "react";

export default function TopBar() {
  const [actorName, setActorName] = useState("Jordan Lee");

  return (
    <div className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="text-lg font-semibold tracking-tight text-slate-900">Trace</div>
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-slate-600" htmlFor="actorName">
          Actor (required)
        </label>
        <input
          id="actorName"
          className="h-9 w-56 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          value={actorName}
          onChange={(event) => setActorName(event.target.value)}
          placeholder="Enter actor name"
        />
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          Current: {actorName || "—"}
        </span>
      </div>
    </div>
  );
}
