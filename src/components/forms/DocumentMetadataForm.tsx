"use client";

import { useFormState } from "react-dom";
import ActorNameField from "@/components/ActorNameField";
import type { ActionState } from "@/lib/actions";

type Props = {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  defaultDueDate?: string;
  defaultStatus: string;
  defaultAssigned?: string;
  defaultTags?: string;
};

const initialState: ActionState = {};

export default function DocumentMetadataForm({
  action,
  defaultDueDate,
  defaultStatus,
  defaultAssigned,
  defaultTags
}: Props) {
  const [state, formAction] = useFormState(action, initialState);

  return (
    <form action={formAction} className="card space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">Edit metadata</h2>
      <ActorNameField />
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Due date
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
            type="date"
            name="dueDate"
            defaultValue={defaultDueDate}
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Status
          <select
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
            name="status"
            defaultValue={defaultStatus}
          >
            <option>Draft</option>
            <option>In Review</option>
            <option>Final</option>
            <option>Sent</option>
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Assigned
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
            name="assigned"
            placeholder="Assignee name"
            defaultValue={defaultAssigned}
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Tags
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
            name="tags"
            placeholder="security, compliance"
            defaultValue={defaultTags}
          />
        </label>
      </div>
      <div>
        <button className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white">
          Save metadata
        </button>
        {state.error && (
          <p className="mt-2 text-sm text-rose-600">{state.error}</p>
        )}
      </div>
    </form>
  );
}
