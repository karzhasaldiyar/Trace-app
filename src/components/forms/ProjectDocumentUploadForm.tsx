"use client";

import { useFormState } from "react-dom";
import ActorNameField from "@/components/ActorNameField";
import type { ActionState } from "@/lib/actions";

type Props = {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
};

const initialState: ActionState = {};

export default function ProjectDocumentUploadForm({ action }: Props) {
  const [state, formAction] = useFormState(action, initialState);

  return (
    <form action={formAction} className="card space-y-4">
      <h3 className="text-base font-semibold text-slate-900">Upload .docx</h3>
      <p className="text-sm text-slate-600">
        Add a .docx with an optional title and a required change note.
      </p>
      <ActorNameField />
      <label className="block text-sm font-medium text-slate-700">
        Title (optional)
        <input
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
          type="text"
          name="title"
          placeholder="Defaults to filename"
        />
      </label>
      <label className="flex w-full cursor-pointer items-center justify-center rounded-lg border border-dashed border-accent bg-white px-4 py-6 text-sm font-semibold text-accent">
        Drag .docx here or browse
        <input
          className="hidden"
          type="file"
          name="file"
          accept=".docx"
          required
        />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Change note (required)
        <textarea
          className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
          rows={4}
          name="changeNote"
          placeholder="Describe the first version"
          required
        />
      </label>
      <button className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white">
        Upload document
      </button>
      {state.error && <p className="text-sm text-rose-600">{state.error}</p>}
    </form>
  );
}
