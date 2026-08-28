import "dotenv/config";
import express from "express";
import helmet from "helmet";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { applySecurityMiddleware } from "../security";
import { sdk } from "./sdk";
import { COOKIE_NAME, ONE_YEAR_MS } from "../../shared/const.js";
import { getSessionCookieOptions } from "./cookies";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Helmet sets secure HTTP response headers (OWASP / Express security best practices)
  app.use(helmet());

  // --- SECURE CORS CONFIGURATION ---
  // Allowlist Expo / local dev origins; support credentialed requests.
  // Mobile clients that omit Origin are allowed via wildcard (no credentials).
  const ALLOWED_ORIGINS = [
    "http://localhost:8081",
    "http://localhost:19000",
    "http://localhost:19006",
    "https://exp.host",
    "https://u.expo.dev",
  ];

  app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Access-Control-Allow-Credentials", "true");
    } else if (!origin) {
      // Native / mobile requests often send no Origin header
      res.header("Access-Control-Allow-Origin", "*");
    }

    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    );

    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Apply security middleware (headers, rate limiting, sanitization, fraud detection)
  applySecurityMiddleware(app);

  registerOAuthRoutes(app);

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: Date.now() });
  });

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log("Preferred port is busy, using an available port instead");
  }

  server.listen(port, () => {
    console.log(`[api] server listening on port ${port}`);
  });
}

startServer().catch(console.error);
