"use client";

import { useFormState } from "react-dom";
import ActorNameField from "@/components/ActorNameField";
import type { ActionState } from "@/lib/actions";

type Props = {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  staleDays: number;
};

const initialState: ActionState = {};

export default function ProjectSettingsForm({ action, staleDays }: Props) {
  const [state, formAction] = useFormState(action, initialState);

  return (
    <form action={formAction} className="card space-y-4">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Settings</h3>
        <p className="text-sm text-slate-600">
          Configure how long documents stay active before becoming stale.
        </p>
      </div>
      <ActorNameField />
      <label className="block text-sm font-medium text-slate-700">
        Stale days
        <input
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm"
          defaultValue={staleDays}
          name="staleDays"
        />
      </label>
      <div>
        <button className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white">
          Save settings
        </button>
        {state.error && (
          <p className="mt-2 text-sm text-rose-600">{state.error}</p>
        )}
      </div>
    </form>
  );
}
