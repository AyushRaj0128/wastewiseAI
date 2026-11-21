import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Role } from "../types.js";

export interface AuthRequest extends Request { user?: { id: string; role: Role; email: string } }
export function auth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Authentication required" });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET || "dev-secret") as AuthRequest["user"]; next(); } catch { res.status(401).json({ message: "Invalid token" }); }
}
export function allow(...roles: Role[]) { return (req: AuthRequest, res: Response, next: NextFunction) => roles.includes(req.user!.role) ? next() : res.status(403).json({ message: "Insufficient role" }); }
