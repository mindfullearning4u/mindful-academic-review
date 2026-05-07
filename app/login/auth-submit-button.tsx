"use client";

import type { ComponentPropsWithoutRef } from "react";
import { useFormStatus } from "react-dom";

type AuthSubmitButtonProps = ComponentPropsWithoutRef<"button"> & {
  idleText: string;
  pendingText: string;
};

export function AuthSubmitButton({
  disabled,
  idleText,
  pendingText,
  ...props
}: AuthSubmitButtonProps) {
  const { action, pending } = useFormStatus();
  const isThisActionPending = pending && action === props.formAction;

  return (
    <button {...props} disabled={pending || disabled}>
      {isThisActionPending ? pendingText : idleText}
    </button>
  );
}
