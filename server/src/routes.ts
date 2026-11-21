import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import { z } from "zod";
import { categories, datasets, users, wasteRecords } from "./data/demo.js";
import { auth, allow, AuthRequest } from "./middleware/auth.js";
import { collectionPlan, dashboard, environmentalImpact, forecast, overview, recommendations, simulate } from "./services/analytics.js";
import { WasteRecord } from "./types.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 }, fileFilter: (_req, file, cb) => cb(null, file.mimetype.includes("csv") || file.originalname.endsWith(".csv")) });
const sign = (u: { id: string; role: string; email: string }) => jwt.sign({ id: u.id, role: u.role, email: u.email }, process.env.JWT_SECRET || "dev-secret", { expiresIn: "1d" });
let records: WasteRecord[] = [...wasteRecords];
const wasteInputSchema = z.object({
  date: z.string().min(8),
  location: z.string().min(1),
  category: z.string().min(1),
  quantityKg: z.preprocess(v => Number(v), z.number().positive()),
  source: z.enum(["Residential","Commercial","Industrial","Institutional","College","Municipal"]),
  disposalMethod: z.enum(["Recycling","Composting","Reuse","Landfill","Incineration","Other"]),
  notes: z.string().optional()
});
const recordKey = (r: Pick<WasteRecord, "date" | "location" | "category" | "quantityKg" | "source" | "disposalMethod">) => [r.date, r.location, r.category, r.quantityKg, r.source, r.disposalMethod].join("|");

router.post("/auth/register", async (req, res) => {
  const body = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(8), organization: z.string().min(2), role: z.enum(["ADMIN","ANALYST","VIEWER"]).default("VIEWER") }).parse(req.body);
  if (users.some(u => u.email === body.email)) return res.status(409).json({ message: "Email already exists" });
  const user = { id: crypto.randomUUID(), name: body.name, email: body.email, passwordHash: await bcrypt.hash(body.password, 10), role: body.role, organization: body.organization, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  users.push(user);
  res.status(201).json({ token: sign(user), user: { ...user, passwordHash: undefined } });
});

router.post("/auth/login", async (req, res) => {
  const body = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(req.body);
  const user = users.find(u => u.email === body.email);
  if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) return res.status(401).json({ message: "Invalid email or password" });
  res.json({ token: sign(user), user: { id: user.id, name: user.name, email: user.email, role: user.role, organization: user.organization } });
});
router.get("/auth/me", auth, (req: AuthRequest, res) => res.json(users.find(u => u.id === req.user?.id)));

router.get("/dashboard/summary", auth, (_req, res) => res.json(dashboard(records)));
router.get("/analytics/overview", auth, (_req, res) => res.json(overview(records)));
router.get("/analytics/categories", auth, (_req, res) => res.json(overview(records).composition));
router.get("/analytics/locations", auth, (_req, res) => res.json(overview(records).locations));
router.get("/analytics/trends", auth, (_req, res) => res.json(overview(records).trends));

router.get("/waste", auth, (_req, res) => res.json(records));
router.post("/waste", auth, allow("ADMIN","ANALYST"), (req: AuthRequest, res) => {
  const body = wasteInputSchema.parse(req.body);
  const cat = categories.find(c => c.name === body.category);
  const row = { id: crypto.randomUUID(), ...body, recyclable: !!cat?.recyclable, createdBy: req.user?.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  records.unshift(row); res.status(201).json(row);
});
router.put("/waste/:id", auth, allow("ADMIN","ANALYST"), (req, res) => { const i = records.findIndex(r => r.id === req.params.id); if (i < 0) return res.status(404).json({ message: "Not found" }); records[i] = { ...records[i], ...req.body, updatedAt: new Date().toISOString() }; res.json(records[i]); });
router.delete("/waste/:id", auth, allow("ADMIN"), (req, res) => { records = records.filter(r => r.id !== req.params.id); res.status(204).end(); });

router.post("/datasets/upload", auth, allow("ADMIN","ANALYST"), upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "CSV file is required" });
  const text = req.file.buffer.toString("utf8");
  const lines = text.trim().split(/\r?\n/).filter(Boolean); const headers = lines[0].split(",").map(h => h.trim());
  const required = ["date","location","category","quantityKg","source","disposalMethod"];
  const missing = required.filter(h => !headers.includes(h));
  if (missing.length) return res.status(400).json({ message: `Missing columns: ${missing.join(", ")}` });
  const parsed = lines.slice(1).map(line => Object.fromEntries(line.split(",").map((v, i) => [headers[i], v.trim()])));
  const existing = new Set(records.map(recordKey));
  const invalidRows: { row: number; errors: string[] }[] = [];
  const validRows: WasteRecord[] = [];
  let duplicates = 0;
  parsed.forEach((raw, i) => {
    const result = wasteInputSchema.safeParse(raw);
    if (!result.success) {
      invalidRows.push({ row: i + 2, errors: result.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`) });
      return;
    }
    if (existing.has(recordKey(result.data))) {
      duplicates += 1;
      return;
    }
    existing.add(recordKey(result.data));
    const cat = categories.find(c => c.name === result.data.category);
    validRows.push({ id: crypto.randomUUID(), ...result.data, recyclable: !!cat?.recyclable, createdBy: (req as AuthRequest).user?.id, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  });
  if (!invalidRows.length && validRows.length) {
    records = [...validRows, ...records];
    datasets.unshift({ id: crypto.randomUUID(), name: req.file.originalname, rows: validRows.length, dateRange: `${validRows.at(-1)?.date} to ${validRows[0]?.date}`, categories: [...new Set(validRows.map(r => r.category))], locations: [...new Set(validRows.map(r => r.location))], quality: { completeness: 100, validity: 100, duplicates: Math.round(duplicates / parsed.length * 100), missingValues: 0 }, createdAt: new Date().toISOString() });
  }
  res.json({ preview: parsed.slice(0, 10), invalidRows, duplicates, message: invalidRows.length ? "Fix invalid rows before importing." : `${validRows.length} records successfully imported.${duplicates ? ` ${duplicates} duplicates skipped.` : ""}` });
});
router.get("/datasets", auth, (_req, res) => res.json(datasets));
router.delete("/datasets/:id", auth, allow("ADMIN"), (_req, res) => res.status(204).end());

router.post("/forecast", auth, (req, res) => res.json(forecast(Number(req.body?.horizon || 30))));
router.get("/forecast", auth, (_req, res) => res.json(forecast(30)));
router.get("/environment/impact", auth, (_req, res) => res.json(environmentalImpact(records)));
router.get("/recommendations", auth, (_req, res) => res.json(recommendations(records)));
router.post("/simulator", auth, (req, res) => res.json(simulate(req.body, records)));
router.get("/collection", auth, (_req, res) => res.json(collectionPlan(records)));
router.get("/reports", auth, (_req, res) => res.json([{ id: "annual-demo", title: "Annual Sustainability Report", createdAt: new Date().toISOString() }]));
router.post("/reports", auth, (_req, res) => res.status(201).json({ id: crypto.randomUUID(), organization: "WasteWise Demo Campus", period: "2026 H1", summary: dashboard(records), impact: environmentalImpact(records), forecast: forecast(30), recommendations: recommendations(records), sdgs: ["SDG 11", "SDG 12", "SDG 13"] }));

export default router;
