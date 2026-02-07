"use client";

import { useFormState } from "react-dom";
import ActorNameField from "@/components/ActorNameField";
import type { ActionState } from "@/lib/actions";

type Props = {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
};

const initialState: ActionState = {};

export default function AddMemberForm({ action }: Props) {
  const [state, formAction] = useFormState(action, initialState);

  return (
    <form action={formAction} className="card space-y-4">
      <h3 className="text-base font-semibold text-slate-900">Add member</h3>
      <ActorNameField />
      <div className="space-y-3 text-sm text-slate-700">
        <label className="block">
          Name
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
            name="memberName"
            placeholder="Full name"
          />
        </label>
        <label className="block">
          Email
          <input
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
            name="memberEmail"
            placeholder="name@company.com"
          />
        </label>
        <label className="block">
          Role
          <select
            className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
            name="memberRole"
          >
            <option>Owner</option>
            <option>Admin</option>
            <option>Member</option>
            <option>Viewer</option>
            <option>Client</option>
          </select>
        </label>
        <button className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white">
          Invite member
        </button>
        {state.error && (
          <p className="text-sm text-rose-600">{state.error}</p>
        )}
      </div>
    </form>
  );
}
