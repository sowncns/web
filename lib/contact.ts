export function getAdminContact() {
  return {
    facebook: process.env.NEXT_PUBLIC_ADMIN_FACEBOOK || "https://facebook.com/"
  };
}
