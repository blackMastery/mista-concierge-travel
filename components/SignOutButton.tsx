"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function signOut() {
    startTransition(async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    });
  }

  return (
    <button
      onClick={signOut}
      disabled={pending}
      className="rounded-lg border-2 border-gold px-6 py-2.5 font-sans text-[14px] font-semibold text-green transition-colors hover:bg-gold hover:text-white disabled:opacity-70"
    >
      {pending ? "Signing out…" : "Sign Out"}
    </button>
  );
}
