import { Router, type Request, type Response, type NextFunction } from "express";
import { db, unitsTable, insertUnitSchema } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: Router = Router();

router.get("/units", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await db.select().from(unitsTable).orderBy(unitsTable.name);
    res.json({ items });
  } catch (e) { next(e); }
});

router.post("/units", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = insertUnitSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    const [created] = await db.insert(unitsTable).values(parsed.data).returning();
    res.status(201).json({ item: created });
  } catch (e) { next(e); }
});

router.patch("/units/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });
    const parsed = insertUnitSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    const [updated] = await db.update(unitsTable).set({ ...parsed.data, updatedAt: new Date() }).where(eq(unitsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json({ item: updated });
  } catch (e) { next(e); }
});

router.delete("/units/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });
    const [deleted] = await db.delete(unitsTable).where(eq(unitsTable.id, id)).returning({ id: unitsTable.id });
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
