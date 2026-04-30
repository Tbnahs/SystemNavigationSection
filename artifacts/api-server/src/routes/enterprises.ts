import { Router, type Request, type Response, type NextFunction } from "express";
import { db, enterprisesTable, insertEnterpriseSchema, employeesTable } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";

const router: Router = Router();

router.get("/enterprises", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await db
      .select()
      .from(enterprisesTable)
      .orderBy(desc(enterprisesTable.createdAt));
    res.json({ items });
  } catch (e) {
    next(e);
  }
});

router.get("/enterprises/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });

    const [item] = await db
      .select()
      .from(enterprisesTable)
      .where(eq(enterprisesTable.id, id));

    if (!item) return res.status(404).json({ error: "Not found" });

    const members = await db
      .select()
      .from(employeesTable)
      .where(eq(employeesTable.enterpriseId, id))
      .orderBy(desc(employeesTable.createdAt));

    res.json({ item, members });
  } catch (e) {
    next(e);
  }
});

router.post("/enterprises", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = insertEnterpriseSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    }
    const [created] = await db.insert(enterprisesTable).values(parsed.data).returning();
    res.status(201).json({ item: created });
  } catch (e) {
    next(e);
  }
});

router.patch("/enterprises/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });

    const parsed = insertEnterpriseSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    }

    const [updated] = await db
      .update(enterprisesTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(enterprisesTable.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json({ item: updated });
  } catch (e) {
    next(e);
  }
});

router.delete("/enterprises/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });

    const [deleted] = await db
      .delete(enterprisesTable)
      .where(eq(enterprisesTable.id, id))
      .returning({ id: enterprisesTable.id });

    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true, id: deleted.id });
  } catch (e) {
    next(e);
  }
});

router.get("/enterprises-stats", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [total] = await db.select({ n: count() }).from(enterprisesTable);
    const [active] = await db.select({ n: count() }).from(enterprisesTable).where(eq(enterprisesTable.status, "active"));
    const [pending] = await db.select({ n: count() }).from(enterprisesTable).where(eq(enterprisesTable.status, "pending"));
    const [locked] = await db.select({ n: count() }).from(enterprisesTable).where(eq(enterprisesTable.status, "locked"));
    res.json({
      total: total?.n ?? 0,
      active: active?.n ?? 0,
      pending: pending?.n ?? 0,
      locked: locked?.n ?? 0,
    });
  } catch (e) {
    next(e);
  }
});

export default router;
