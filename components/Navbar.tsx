import { createClient } from "@/lib/supabase/server";
import { NavbarClient } from "@/components/NavbarClient";

export async function Navbar() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase.from("profiles").select("role,balance").eq("id", user.id).single() : { data: null };

  return <NavbarClient userEmail={user?.email} profile={profile} />;
}
