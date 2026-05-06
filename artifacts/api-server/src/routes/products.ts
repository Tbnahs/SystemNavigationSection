import { Router, type Request, type Response, type NextFunction } from "express";
import { db, productsTable, unitsTable, enterprisesTable, insertProductSchema } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: Router = Router();

router.get("/products", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await db
      .select({
        id: productsTable.id,
        enterpriseId: productsTable.enterpriseId,
        name: productsTable.name,
        code: productsTable.code,
        type: productsTable.type,
        unitId: productsTable.unitId,
        price: productsTable.price,
        gtin: productsTable.gtin,
        imageUrl: productsTable.imageUrl,
        description: productsTable.description,
        status: productsTable.status,
        createdAt: productsTable.createdAt,
        updatedAt: productsTable.updatedAt,
        unitName: unitsTable.abbreviation,
        enterpriseName: enterprisesTable.tenHienThi,
      })
      .from(productsTable)
      .leftJoin(unitsTable, eq(productsTable.unitId, unitsTable.id))
      .leftJoin(enterprisesTable, eq(productsTable.enterpriseId, enterprisesTable.id))
      .orderBy(desc(productsTable.createdAt));
    res.json({ items });
  } catch (e) { next(e); }
});

router.post("/products", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = insertProductSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    const [created] = await db.insert(productsTable).values(parsed.data).returning();
    res.status(201).json({ item: created });
  } catch (e) { next(e); }
});

router.patch("/products/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });
    const parsed = insertProductSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    const [updated] = await db.update(productsTable).set({ ...parsed.data, updatedAt: new Date() }).where(eq(productsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json({ item: updated });
  } catch (e) { next(e); }
});

router.delete("/products/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });
    const [deleted] = await db.delete(productsTable).where(eq(productsTable.id, id)).returning({ id: productsTable.id });
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
