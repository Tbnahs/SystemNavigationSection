import { Router, type Request, type Response, type NextFunction } from "express";
import { db, facilitiesTable, facilityEmployeesTable, employeesTable, enterprisesTable, insertFacilitySchema } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: Router = Router();

router.get("/facilities", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await db
      .select({
        id: facilitiesTable.id,
        enterpriseId: facilitiesTable.enterpriseId,
        name: facilitiesTable.name,
        code: facilitiesTable.code,
        type: facilitiesTable.type,
        phone: facilitiesTable.phone,
        address: facilitiesTable.address,
        tinh: facilitiesTable.tinh,
        xa: facilitiesTable.xa,
        gln: facilitiesTable.gln,
        status: facilitiesTable.status,
        notes: facilitiesTable.notes,
        createdAt: facilitiesTable.createdAt,
        updatedAt: facilitiesTable.updatedAt,
        enterpriseName: enterprisesTable.tenHienThi,
      })
      .from(facilitiesTable)
      .leftJoin(enterprisesTable, eq(facilitiesTable.enterpriseId, enterprisesTable.id))
      .orderBy(desc(facilitiesTable.createdAt));
    res.json({ items });
  } catch (e) { next(e); }
});

router.get("/facilities/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });
    const [item] = await db.select().from(facilitiesTable).where(eq(facilitiesTable.id, id));
    if (!item) return res.status(404).json({ error: "Not found" });
    const assignments = await db
      .select({ employeeId: facilityEmployeesTable.employeeId, name: employeesTable.name, role: employeesTable.role, avatarColor: employeesTable.avatarColor })
      .from(facilityEmployeesTable)
      .leftJoin(employeesTable, eq(facilityEmployeesTable.employeeId, employeesTable.id))
      .where(eq(facilityEmployeesTable.facilityId, id));
    res.json({ item, assignments });
  } catch (e) { next(e); }
});

router.post("/facilities", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = insertFacilitySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    const [created] = await db.insert(facilitiesTable).values(parsed.data).returning();
    res.status(201).json({ item: created });
  } catch (e) { next(e); }
});

router.patch("/facilities/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });
    const parsed = insertFacilitySchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    const [updated] = await db.update(facilitiesTable).set({ ...parsed.data, updatedAt: new Date() }).where(eq(facilitiesTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json({ item: updated });
  } catch (e) { next(e); }
});

router.delete("/facilities/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });
    const [deleted] = await db.delete(facilitiesTable).where(eq(facilitiesTable.id, id)).returning({ id: facilitiesTable.id });
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.post("/facilities/:id/assign", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const facilityId = Number(req.params.id);
    if (!Number.isFinite(facilityId)) return res.status(400).json({ error: "Invalid id" });
    const { employeeIds } = req.body as { employeeIds: number[] };
    await db.delete(facilityEmployeesTable).where(eq(facilityEmployeesTable.facilityId, facilityId));
    if (employeeIds?.length) {
      await db.insert(facilityEmployeesTable).values(employeeIds.map(eid => ({ facilityId, employeeId: eid })));
    }
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
