import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const hasEnv = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Returns the signed-in user if they are an admin, otherwise null.
export async function getAdminUser(): Promise<User | null> {
  if (!hasEnv) return null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();
    return data?.is_admin ? user : null;
  } catch {
    return null;
  }
}

// Guards admin server components and actions: redirects non-admins away.
export async function requireAdmin(): Promise<User> {
  if (!hasEnv) redirect("/login?redirect=/admin");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/admin");

  const { data } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!data?.is_admin) redirect("/");
  return user;
}

// Cheap check for the public Header (no redirect).
export async function isCurrentUserAdmin(): Promise<boolean> {
  return (await getAdminUser()) !== null;
}
