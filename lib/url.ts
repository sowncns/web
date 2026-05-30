export function getAppUrl(request?: Request) {
  const configuredUrl = process.env.APP_URL?.trim();
  if (configuredUrl && !configuredUrl.includes("localhost") && !configuredUrl.includes("127.0.0.1")) {
    return configuredUrl.replace(/\/$/, "");
  }

  if (request) {
    const forwardedHost = request.headers.get("x-forwarded-host");
    const host = forwardedHost || request.headers.get("host");
    if (host) {
      const proto = request.headers.get("x-forwarded-proto") || new URL(request.url).protocol.replace(":", "") || "https";
      return `${proto}://${host}`.replace(/\/$/, "");
    }

    return new URL(request.url).origin;
  }

  return configuredUrl?.replace(/\/$/, "") || "http://localhost:3000";
}
