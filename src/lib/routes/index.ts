/**
 * An array of routes that are accessible to the public.
 * those routes do not require authentication
 * logged-in user is also allowed to access /auth/new-verification to verify their email
 * @type {sting[]}
 */
export const publicRoutes = [
  "/",
  "/es",
  "/en",
  "/auth/new-verification",
  "/marketing-salon",
];

/**
 * An array of routes that are used for authentication.
 * those routes will redirect logged-in users to /settings.
 * only logged-out users access those routes.
 * @type {sting[]}
 */
export const authRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/error",
  "/auth/reset-password",
  "/auth/new-password",
];

/**
 * The prefix for API authentication routes
 * Routes that starts with this prefix are used for API authentication purpose
 * @type{string}
 */
export const apiAuthPrefix = "/api/auth";

/**
 * the default redirect path after logging
 * @type{string}
 */
export const DEFAULT_LOGIN_REDIRECT = "/auth";

/**
 * auth routes need the redirection
 * @type{string[]}
 */
export const routesNeedRedirect = [];
