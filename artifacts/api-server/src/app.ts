import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import {
  securityHeadersMiddleware,
  scannerDefenseMiddleware,
  globalRateLimiterMiddleware,
  orderRateLimiterMiddleware,
} from "./middlewares/security";

const app: Express = express();

// 1. Enterprise Security Headers (OWASP)
app.use(securityHeadersMiddleware);

// 2. Automated Scanner & Exploit Blocker
app.use(scannerDefenseMiddleware);

// 3. Global Anti-DDoS Rate Limiter
app.use(globalRateLimiterMiddleware);

// Logging
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// 4. Strict CORS Whitelist Configuration
const allowedOrigins = [
  "https://finalflash.dz",
  "https://www.finalflash.dz",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];
if (process.env["CORS_ALLOWED_ORIGINS"]) {
  const extraOrigins = process.env["CORS_ALLOWED_ORIGINS"]
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  allowedOrigins.push(...extraOrigins);
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (such as mobile apps, curl, or server-side calls)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS policy violation: Unauthorized origin"));
    },
    methods: ["GET", "POST", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "X-Admin-Key"],
    credentials: true,
  }),
);

// 5. Payload Bomb & Memory Exhaustion Defense (Strict 50kb limit)
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ limit: "50kb", extended: true }));

// 6. Handle Malformed JSON Payloads gracefully without stack leak
app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && "body" in (err as unknown as Record<string, unknown>)) {
    res.status(400).json({ error: "Malformed JSON payload provided", code: "BAD_REQUEST" });
    return;
  }
  next(err);
});

// 7. Order-specific Anti-Spam Rate Limiter
app.use("/api/orders", orderRateLimiterMiddleware);

// API Routes
app.use("/api", router);

export default app;
