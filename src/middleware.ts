import { chain } from "@/src/middleware/chain";
import { withI18nMiddleware } from "@/src/middleware/withI18nMiddleware";
import { routeGuardMiddleware } from "@/src/middleware/route-guard-middleware";
import { withApiKeyAuth } from "@/src/middleware/withApiKeyAuth";

export default chain([
  withI18nMiddleware, 
  withApiKeyAuth,
  routeGuardMiddleware
]);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
