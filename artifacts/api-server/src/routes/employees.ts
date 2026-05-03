import { Router, type Request, type Response, type NextFunction } from "express";
import bcrypt from "bcryptjs";
import { db, employeesTable, enterprisesTable, insertEmployeeSchema } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";

const router: Router = Router();

router.get("/employees", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await db
      .select({
        id: employeesTable.id,
        enterpriseId: employeesTable.enterpriseId,
        name: employeesTable.name,
        email: employeesTable.email,
        phone: employeesTable.phone,
        role: employeesTable.role,
        status: employeesTable.status,
        avatarColor: employeesTable.avatarColor,
        avatarUrl: employeesTable.avatarUrl,
        lastSeen: employeesTable.lastSeen,
        createdAt: employeesTable.createdAt,
        updatedAt: employeesTable.updatedAt,
        enterpriseName: enterprisesTable.tenHienThi,
      })
      .from(employeesTable)
      .leftJoin(enterprisesTable, eq(employeesTable.enterpriseId, enterprisesTable.id))
      .orderBy(desc(employeesTable.createdAt));
    res.json({ items });
  } catch (e) {
    next(e);
  }
});

router.post("/employees", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = insertEmployeeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    }
    const [created] = await db.insert(employeesTable).values(parsed.data).returning();
    res.status(201).json({ item: created });
  } catch (e) {
    next(e);
  }
});

router.patch("/employees/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });

    const parsed = insertEmployeeSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    }

    const [updated] = await db
      .update(employeesTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(employeesTable.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json({ item: updated });
  } catch (e) {
    next(e);
  }
});

router.delete("/employees/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });

    const [deleted] = await db
      .delete(employeesTable)
      .where(eq(employeesTable.id, id))
      .returning({ id: employeesTable.id });

    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true, id: deleted.id });
  } catch (e) {
    next(e);
  }
});

router.get("/employees-stats", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [total] = await db.select({ n: count() }).from(employeesTable);
    const [active] = await db.select({ n: count() }).from(employeesTable).where(eq(employeesTable.status, "active"));
    const [invited] = await db.select({ n: count() }).from(employeesTable).where(eq(employeesTable.status, "invited"));
    const [locked] = await db.select({ n: count() }).from(employeesTable).where(eq(employeesTable.status, "locked"));
    res.json({
      total: total?.n ?? 0,
      active: active?.n ?? 0,
      invited: invited?.n ?? 0,
      locked: locked?.n ?? 0,
    });
  } catch (e) {
    next(e);
  }
});

/* Reset mật khẩu mặc định */
router.post("/employees/:id/reset-password", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });

    const DEFAULT_PASSWORD = "esgvalley@2025";
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    const [updated] = await db
      .update(employeesTable)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(employeesTable.id, id))
      .returning({ id: employeesTable.id, name: employeesTable.name });

    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true, defaultPassword: DEFAULT_PASSWORD });
  } catch (e) {
    next(e);
  }
});

export default router;
