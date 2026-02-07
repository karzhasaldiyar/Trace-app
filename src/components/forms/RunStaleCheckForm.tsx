"use client";

import { useFormState } from "react-dom";
import ActorNameField from "@/components/ActorNameField";
import type { ActionState } from "@/lib/actions";

type Props = {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
};

const initialState: ActionState = {};

export default function RunStaleCheckForm({ action }: Props) {
  const [state, formAction] = useFormState(action, initialState);

  return (
    <form action={formAction} className="card space-y-4">
      <div>
        <h3 className="text-base font-semibold text-slate-900">
          Stale check
        </h3>
        <p className="text-sm text-slate-600">
          Scan documents and mark any overdue items as stale.
        </p>
      </div>
      <ActorNameField />
      <div>
        <button className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white">
          Run stale check now
        </button>
        {state.error && (
          <p className="mt-2 text-sm text-rose-600">{state.error}</p>
        )}
      </div>
    </form>
  );
}
