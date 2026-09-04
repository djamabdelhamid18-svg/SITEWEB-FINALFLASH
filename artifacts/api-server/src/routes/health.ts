import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/healthz", async (_req, res) => {
  let dbStatus = "unconnected";
  let dbLatencyMs = -1;

  const startTime = Date.now();
  try {
    await db.execute(sql`SELECT 1`);
    dbLatencyMs = Date.now() - startTime;
    dbStatus = "healthy";
  } catch (err) {
    dbStatus = "degraded";
  }

  const memory = process.memoryUsage();

  res.json({
    status: dbStatus === "healthy" ? "pass" : "degraded",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    services: {
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
    },
    system: {
      nodeVersion: process.version,
      memoryRssMb: Math.round(memory.rss / (1024 * 1024)),
      memoryHeapUsedMb: Math.round(memory.heapUsed / (1024 * 1024)),
    },
  });
});

export default router;
