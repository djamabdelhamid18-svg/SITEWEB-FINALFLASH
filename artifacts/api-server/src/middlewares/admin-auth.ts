import type { Request, Response, NextFunction } from "express";

/**
 * Strict Admin Authentication Middleware
 * Enforces ADMIN_KEY environment variable. Rejects requests if not configured or mismatched.
 */
export function adminAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  const configuredAdminKey = process.env.ADMIN_KEY;
  if (!configuredAdminKey) {
    req.log?.error?.("Security alert: ADMIN_KEY environment variable is not configured. Blocking admin endpoint.");
    res.status(500).json({
      error: "Server configuration error: Admin authentication key is not configured in environment.",
      code: "ADMIN_AUTH_NOT_CONFIGURED",
    });
    return;
  }

  const providedKey =
    req.headers["x-admin-key"] || req.headers["authorization"]?.replace(/^Bearer\s+/i, "");

  if (!providedKey || providedKey !== configuredAdminKey) {
    req.log?.warn?.("Unauthorized attempt to access admin endpoint");
    res.status(401).json({
      error: "Unauthorized: Valid admin access key required.",
      code: "UNAUTHORIZED_ADMIN_ACCESS",
    });
    return;
  }

  next();
}
