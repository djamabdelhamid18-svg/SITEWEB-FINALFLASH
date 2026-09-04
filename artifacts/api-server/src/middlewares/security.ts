import type { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";

/**
 * Known malicious vulnerability scanners and hacking tool user-agent signatures.
 */
const MALICIOUS_USER_AGENTS = [
  "sqlmap",
  "nikto",
  "masscan",
  "wpscan",
  "dirbuster",
  "nmap",
  "nessus",
  "acunetix",
  "havij",
  "metasploit",
  "burpcollaborator",
  "zgrab",
  "gobuster"
];

/**
 * In-memory sliding window rate-limiting record.
 */
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

class MemoryRateLimiter {
  private store = new Map<string, RateLimitRecord>();
  private windowMs: number;
  private maxRequests: number;
  private name: string;

  constructor(name: string, windowMs: number, maxRequests: number) {
    this.name = name;
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Periodic cleanup of expired rate-limit records to ensure 0 memory leaks
    setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.store.entries()) {
        if (record.resetAt <= now) {
          this.store.delete(key);
        }
      }
    }, Math.min(windowMs, 60000)).unref();
  }

  public check(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    let record = this.store.get(ip);

    if (!record || record.resetAt <= now) {
      record = { count: 1, resetAt: now + this.windowMs };
      this.store.set(ip, record);
      return { allowed: true, remaining: this.maxRequests - 1, resetTime: record.resetAt };
    }

    record.count += 1;
    if (record.count > this.maxRequests) {
      return { allowed: false, remaining: 0, resetTime: record.resetAt };
    }

    return { allowed: true, remaining: this.maxRequests - record.count, resetTime: record.resetAt };
  }
}

// Global API Rate Limiter: 150 requests per minute per IP
const globalLimiter = new MemoryRateLimiter("GlobalDDoSProtection", 60 * 1000, 150);

// Strict Order Creation Limiter: 6 orders per 15 minutes per IP to block checkout bots and spam
const orderCreationLimiter = new MemoryRateLimiter("OrderSpamProtection", 15 * 60 * 1000, 6);

/**
 * Extracts client IP safely.
 * IMPORTANT: X-Forwarded-For is trivially spoofable by attackers.
 * We use req.socket.remoteAddress as the authoritative source.
 * Only fall back to X-Forwarded-For if explicitly trusted (e.g. behind Cloudflare/Nginx),
 * which requires trust proxy to be configured in Express — not done here, so we ignore the header.
 */
function getClientIp(req: Request): string {
  return req.socket.remoteAddress || "127.0.0.1";
}

/**
 * OWASP Hardened Security Headers Middleware
 */
export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Prevent Express signature leaking
  res.removeHeader("X-Powered-By");

  // Prevent Clickjacking (framing attacks)
  res.setHeader("X-Frame-Options", "DENY");

  // Prevent MIME-sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // XSS protection for legacy browsers
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Referrer leakage prevention
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Strict Transport Security (HSTS - 1 year)
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

  // Restrict browser permissions
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");

  // Cross-Origin headers
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

  next();
}

/**
 * Bot and Automated Exploit Scanner Defense
 */
export function scannerDefenseMiddleware(req: Request, res: Response, next: NextFunction): void {
  const userAgent = (req.headers["user-agent"] || "").toLowerCase();

  const isMalicious = MALICIOUS_USER_AGENTS.some((badAgent) => userAgent.includes(badAgent));
  if (isMalicious) {
    const ip = getClientIp(req);
    logger.warn({ ip, userAgent, path: req.path }, "Blocked automated exploit scanner attempt");
    res.status(403).json({
      error: "Access Denied: Malicious scanner or automated tool signature detected.",
      code: "SECURITY_SCANNER_BLOCKED"
    });
    return;
  }

  next();
}

/**
 * Anti-DDoS Global Rate Limiting Middleware
 */
export function globalRateLimiterMiddleware(req: Request, res: Response, next: NextFunction): void {
  const ip = getClientIp(req);
  const result = globalLimiter.check(ip);

  res.setHeader("X-RateLimit-Limit", "150");
  res.setHeader("X-RateLimit-Remaining", result.remaining.toString());
  res.setHeader("X-RateLimit-Reset", Math.ceil(result.resetTime / 1000).toString());

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
    res.setHeader("Retry-After", retryAfter.toString());
    logger.warn({ ip, path: req.path }, "Global rate limit exceeded (Anti-DDoS trigger)");

    res.status(429).json({
      error: "Too many requests. Anti-DDoS rate limiting protection active. Please slow down.",
      retryAfterSeconds: retryAfter,
      code: "RATE_LIMIT_EXCEEDED"
    });
    return;
  }

  next();
}

/**
 * Strict Order Creation Anti-Spam Rate Limiting Middleware
 */
export function orderRateLimiterMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (req.method !== "POST") {
    next();
    return;
  }

  const ip = getClientIp(req);
  const result = orderCreationLimiter.check(ip);

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
    res.setHeader("Retry-After", retryAfter.toString());
    logger.warn({ ip }, "Order submission rate limit exceeded (Order spam protection)");

    res.status(429).json({
      error: "Order rate limit exceeded. Please wait a few minutes before submitting another order.",
      retryAfterSeconds: retryAfter,
      code: "ORDER_RATE_LIMIT_EXCEEDED"
    });
    return;
  }

  next();
}
