import { Router, type Request, type Response, type NextFunction } from "express";
import { db, gradesTable, qualityLevelsTable, standardsTable, insertGradeSchema, insertQualityLevelSchema, insertStandardSchema } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: Router = Router();

/* ─── Grades (Quy cách) ─────────────────────────── */
router.get("/grades", async (_req, res, next) => {
  try {
    const items = await db.select().from(gradesTable).orderBy(gradesTable.name);
    res.json({ items });
  } catch (e) { next(e); }
});

router.post("/grades", async (req, res, next) => {
  try {
    const parsed = insertGradeSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    const [created] = await db.insert(gradesTable).values(parsed.data).returning();
    res.status(201).json({ item: created });
  } catch (e) { next(e); }
});

router.patch("/grades/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });
    const parsed = insertGradeSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    const [updated] = await db.update(gradesTable).set({ ...parsed.data, updatedAt: new Date() }).where(eq(gradesTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json({ item: updated });
  } catch (e) { next(e); }
});

router.delete("/grades/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });
    const [deleted] = await db.delete(gradesTable).where(eq(gradesTable.id, id)).returning({ id: gradesTable.id });
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

/* ─── Quality Levels (% Chất lượng) ─────────────── */
router.get("/quality-levels", async (_req, res, next) => {
  try {
    const items = await db.select().from(qualityLevelsTable).orderBy(qualityLevelsTable.id);
    res.json({ items });
  } catch (e) { next(e); }
});

router.post("/quality-levels", async (req, res, next) => {
  try {
    const parsed = insertQualityLevelSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    const [created] = await db.insert(qualityLevelsTable).values(parsed.data).returning();
    res.status(201).json({ item: created });
  } catch (e) { next(e); }
});

router.patch("/quality-levels/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });
    const parsed = insertQualityLevelSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    const [updated] = await db.update(qualityLevelsTable).set({ ...parsed.data, updatedAt: new Date() }).where(eq(qualityLevelsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json({ item: updated });
  } catch (e) { next(e); }
});

router.delete("/quality-levels/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });
    const [deleted] = await db.delete(qualityLevelsTable).where(eq(qualityLevelsTable.id, id)).returning({ id: qualityLevelsTable.id });
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

/* ─── Standards (Tiêu chuẩn) ────────────────────── */
router.get("/standards", async (_req, res, next) => {
  try {
    const items = await db.select().from(standardsTable).orderBy(standardsTable.id);
    res.json({ items });
  } catch (e) { next(e); }
});

router.post("/standards", async (req, res, next) => {
  try {
    const parsed = insertStandardSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    const [created] = await db.insert(standardsTable).values(parsed.data).returning();
    res.status(201).json({ item: created });
  } catch (e) { next(e); }
});

router.patch("/standards/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });
    const parsed = insertStandardSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    const [updated] = await db.update(standardsTable).set({ ...parsed.data, updatedAt: new Date() }).where(eq(standardsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json({ item: updated });
  } catch (e) { next(e); }
});

router.delete("/standards/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });
    const [deleted] = await db.delete(standardsTable).where(eq(standardsTable.id, id)).returning({ id: standardsTable.id });
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
