const INTERNAL_ACCOUNT_DOMAIN = "accounts.shopmmogiare.local";

export function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

export function getAccountEmail(username: string) {
  return `${normalizeUsername(username)}@${INTERNAL_ACCOUNT_DOMAIN}`;
}
