"use client";

import { btnDanger } from "@/components/admin/ui";

// Wraps a bound server action in a form and asks for confirmation on submit.
export function ConfirmButton({
  action,
  children = "Delete",
  confirmText = "Are you sure? This cannot be undone.",
  className = btnDanger,
}: {
  action: () => Promise<unknown>;
  children?: React.ReactNode;
  confirmText?: string;
  className?: string;
}) {
  return (
    <form
      action={action as unknown as (formData: FormData) => void}
      onSubmit={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
    >
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}
