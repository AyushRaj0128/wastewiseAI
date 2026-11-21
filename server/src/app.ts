import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import routes from "./routes.js";

export const app = express();
app.use(helmet());
const allowedOrigins = new Set([process.env.CLIENT_ORIGIN || "http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"]);
app.use(cors({ origin: (origin, cb) => cb(null, !origin || allowedOrigins.has(origin)), credentials: true }));
app.use(rateLimit({ windowMs: 60_000, limit: 120 }));
app.use(express.json({ limit: "1mb" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "WasteWise AI API" }));
app.use("/api", routes);
app.use((_req, res) => res.status(404).json({ message: "Route not found" }));
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const message = err instanceof Error ? err.message : "Unexpected error";
  res.status(message.includes("validation") || message.includes("Required") ? 400 : 500).json({ message });
});
