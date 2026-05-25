import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * proxy.ts — Supabase session refresh + route protection
 *
 * NOTE: In Next.js 16, `middleware.ts` was renamed to `proxy.ts` and the
 * exported function renamed from `middleware` to `proxy`.
 * See: https://nextjs.org/docs/messages/middleware-to-proxy
 *
 * Runs on every request (except static assets) via the matcher below.
 * Responsibilities:
 *   1. Refresh the Supabase session cookie if it has expired.
 *   2. Redirect unauthenticated users to /login.
 *   3. Redirect authenticated users away from /login to the dashboard.
 */
export async function proxy(request: NextRequest) {
  // Start with the default Next.js response, preserving the request headers.
  let supabaseResponse = NextResponse.next({
    request,
  });

  // ── Build a server-side Supabase client scoped to this request ──────────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Step 1: write cookies back onto the request (for downstream proxy).
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Step 2: rebuild the response so the updated cookies are sent to the browser.
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // ── IMPORTANT: getUser() MUST be called to refresh an expired session ───
  // Do NOT use getSession() here — it reads from the cookie only and does
  // not validate the JWT with Supabase Auth servers.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ── Public routes — no auth required ────────────────────────────────────
  const publicRoutes = ["/login"];
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // ── Route protection logic ───────────────────────────────────────────────

  // If not authenticated and trying to access a protected route → /login
  if (!user && !isPublicRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    // Preserve the intended destination so we can redirect after login.
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated and hitting /login → redirect to dashboard home
  if (user && pathname === "/login") {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/";
    dashboardUrl.searchParams.delete("redirectTo");
    return NextResponse.redirect(dashboardUrl);
  }

  // ── Return the (possibly cookie-refreshed) response ─────────────────────
  // CRITICAL: return `supabaseResponse`, not a new NextResponse.next().
  // Returning a different response object would drop the refreshed cookies.
  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     *   - _next/static  (static files)
     *   - _next/image   (image optimisation)
     *   - favicon.ico   (browser default)
     *   - Public file extensions: svg, png, jpg, jpeg, gif, webp, ico
     *
     * This ensures proxy runs on page routes and Server Actions only.
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
