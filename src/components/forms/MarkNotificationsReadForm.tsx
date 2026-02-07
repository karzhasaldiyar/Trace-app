"use client";

import { useFormState } from "react-dom";
import ActorNameField from "@/components/ActorNameField";
import type { ActionState } from "@/lib/actions";

type Props = {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
};

const initialState: ActionState = {};

export default function MarkNotificationsReadForm({ action }: Props) {
  const [state, formAction] = useFormState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col items-end gap-2">
      <ActorNameField />
      <button className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white">
        Mark read
      </button>
      {state.error && (
        <p className="text-sm text-rose-600">{state.error}</p>
      )}
    </form>
  );
}
