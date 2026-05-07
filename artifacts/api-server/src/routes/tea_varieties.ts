import { Router, type Request, type Response, type NextFunction } from "express";
import { db, teaVarietiesTable, productsTable, insertTeaVarietySchema } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: Router = Router();

router.get("/tea-varieties", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await db
      .select({
        id: teaVarietiesTable.id,
        name: teaVarietiesTable.name,
        code: teaVarietiesTable.code,
        notes: teaVarietiesTable.notes,
        productId: teaVarietiesTable.productId,
        createdAt: teaVarietiesTable.createdAt,
        updatedAt: teaVarietiesTable.updatedAt,
        productName: productsTable.name,
      })
      .from(teaVarietiesTable)
      .leftJoin(productsTable, eq(teaVarietiesTable.productId, productsTable.id))
      .orderBy(teaVarietiesTable.name);
    res.json({ items });
  } catch (e) { next(e); }
});

router.post("/tea-varieties", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = insertTeaVarietySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    const [created] = await db.insert(teaVarietiesTable).values(parsed.data).returning();
    res.status(201).json({ item: created });
  } catch (e) { next(e); }
});

router.patch("/tea-varieties/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });
    const parsed = insertTeaVarietySchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    const [updated] = await db.update(teaVarietiesTable).set({ ...parsed.data, updatedAt: new Date() }).where(eq(teaVarietiesTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json({ item: updated });
  } catch (e) { next(e); }
});

router.delete("/tea-varieties/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });
    const [deleted] = await db.delete(teaVarietiesTable).where(eq(teaVarietiesTable.id, id)).returning({ id: teaVarietiesTable.id });
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
