"use client";

import { useFormState } from "react-dom";
import ActorNameField from "@/components/ActorNameField";
import type { ActionState } from "@/lib/actions";

type Props = {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
};

const initialState: ActionState = {};

export default function CreateProjectForm({ action }: Props) {
  const [state, formAction] = useFormState(action, initialState);

  return (
    <form action={formAction} className="card space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">Create project</h2>
      <p className="text-sm text-slate-600">
        Use this modal-style form to add a new project.
      </p>
      <ActorNameField />
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Project name
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm"
            name="projectName"
            placeholder="e.g. Q4 Compliance Review"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Stale days (default 7)
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm"
            defaultValue="7"
            name="staleDays"
          />
        </label>
      </div>
      <div>
        <button className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white">
          Save project
        </button>
        {state.error && (
          <p className="mt-2 text-sm text-rose-600">{state.error}</p>
        )}
      </div>
    </form>
  );
}
