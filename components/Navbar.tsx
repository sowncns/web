import { NavbarClient } from "@/components/NavbarClient";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth";

export async function Navbar() {
  const user = await getCurrentUser();
  const profile = user ? await getCurrentProfile() : null;

  return <NavbarClient signedIn={Boolean(user)} profile={profile} />;
}
