import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function getSafeNext(request: Request) {
  const { searchParams } = new URL(request.url);
  const next = searchParams.get("next") || "/";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

function getRequestOrigin(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost || request.headers.get("host");
  if (!host) return new URL(request.url).origin;
  const proto = request.headers.get("x-forwarded-proto") || new URL(request.url).protocol.replace(":", "") || "https";
  return `${proto}://${host}`.replace(/\/$/, "");
}

export async function GET(request: Request) {
  const next = getSafeNext(request);
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${getRequestOrigin(request)}/auth/callback?next=${encodeURIComponent(next)}`,
      queryParams: {
        access_type: "offline",
        prompt: "select_account"
      }
    }
  });

  if (error || !data.url) {
    return NextResponse.redirect(new URL("/login?error=Không thể đăng nhập bằng Google", request.url));
  }

  return NextResponse.redirect(data.url);
}
