import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import {
  isBypassRoutes,
  isProtectedRoutes,
  isPublicRoutes,
} from "./lib/permissions";

const PublicMatcher = createRouteMatcher(isPublicRoutes);
const ProtectedMatcher = createRouteMatcher(isProtectedRoutes);
const BypassMatcher = createRouteMatcher(isBypassRoutes);
const SecureGateMatcher = createRouteMatcher(["/secure-gate"]);
const GateProtectedMatcher = createRouteMatcher(["/", "/auth(.*)"]);

const gateSecret = process.env.BETA_GATE_SECRET;
const gateEnabled = process.env.BETA_GATE_ENABLED !== "false" && !!gateSecret;
const gateSecretBytes = gateSecret ? new TextEncoder().encode(gateSecret) : null;

const hasGateCookie = async (request: NextRequest) => {
  if (!gateEnabled || !gateSecretBytes) return false;
  const token = request.cookies.get("beta_gate")?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, gateSecretBytes);
    return true;
  } catch (err) {
    console.warn("[middleware] invalid beta_gate token", err);
    return false;
  }
};

export default convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    if (BypassMatcher(request)) return;

    const authed = await convexAuth.isAuthenticated();

    console.log(authed);

    if (gateEnabled && !authed && GateProtectedMatcher(request) && !SecureGateMatcher(request)) {
      const gateOk = await hasGateCookie(request);
      if (!gateOk) {
        return nextjsMiddlewareRedirect(request, `/secure-gate`);
      }
    }

    if (PublicMatcher(request) && authed) {
      return nextjsMiddlewareRedirect(request, `/dashboard`);
    }

    if (ProtectedMatcher(request) && !authed) {
      return nextjsMiddlewareRedirect(request, `/auth/sign-in`);
    }

    return;
  },
  {
    cookieConfig: { maxAge: 60 * 60 * 24 * 30 },
  }
);

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
