export const BASE_URL = process.env.NEXT_PUBLIC_APP_URL;
export const API_URL = `${BASE_URL}/api`;

export const isPublicRoutes = ["/auth(.*)", "/", "/secure-gate"];

export const isProtectedRoutes = ["/dashboard(.*)"];

export const isBypassRoutes = [
  "/api/polar/webhook",
  "/api/inngest(.*)",
  "/api/auth(.*)",
  "/convex(.*)",
  "/api/beta(.*)",
];
