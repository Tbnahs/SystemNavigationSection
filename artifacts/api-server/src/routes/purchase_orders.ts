import { Router, type Request, type Response, type NextFunction } from "express";
import {
  db, purchaseOrdersTable, purchaseOrderItemsTable,
  enterprisesTable, facilitiesTable,
  insertPurchaseOrderSchema, insertPurchaseOrderItemSchema
} from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: Router = Router();

router.get("/purchase-orders", async (_req, res, next) => {
  try {
    const items = await db
      .select({
        id: purchaseOrdersTable.id,
        maPhieu: purchaseOrdersTable.maPhieu,
        enterpriseId: purchaseOrdersTable.enterpriseId,
        facilityId: purchaseOrdersTable.facilityId,
        facilityName: purchaseOrdersTable.facilityName,
        diaChuThu: purchaseOrdersTable.diaChuThu,
        maLoMe: purchaseOrdersTable.maLoMe,
        ngayThu: purchaseOrdersTable.ngayThu,
        status: purchaseOrdersTable.status,
        notes: purchaseOrdersTable.notes,
        total: purchaseOrdersTable.total,
        lamTron: purchaseOrdersTable.lamTron,
        khoiLuongTong: purchaseOrdersTable.khoiLuongTong,
        createdAt: purchaseOrdersTable.createdAt,
        updatedAt: purchaseOrdersTable.updatedAt,
        enterpriseName: enterprisesTable.tenHienThi,
      })
      .from(purchaseOrdersTable)
      .leftJoin(enterprisesTable, eq(purchaseOrdersTable.enterpriseId, enterprisesTable.id))
      .orderBy(desc(purchaseOrdersTable.createdAt));
    res.json({ items });
  } catch (e) { next(e); }
});

router.get("/purchase-orders/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });
    const [item] = await db.select().from(purchaseOrdersTable).where(eq(purchaseOrdersTable.id, id));
    if (!item) return res.status(404).json({ error: "Not found" });
    const lineItems = await db.select().from(purchaseOrderItemsTable).where(eq(purchaseOrderItemsTable.orderId, id));
    res.json({ item, lineItems });
  } catch (e) { next(e); }
});

router.post("/purchase-orders", async (req, res, next) => {
  try {
    const { lineItems, ...orderData } = req.body as { lineItems?: typeof purchaseOrderItemsTable.$inferSelect[]; [k: string]: unknown };
    const khoiLuongTong = String(
      (lineItems ?? []).reduce((acc, li) => acc + (parseFloat(String(li.khoiLuong)) || 0), 0)
    );
    const parsed = insertPurchaseOrderSchema.safeParse({ ...orderData, khoiLuongTong });
    if (!parsed.success) return res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    const [created] = await db.insert(purchaseOrdersTable).values(parsed.data).returning();
    if (lineItems?.length) {
      await db.insert(purchaseOrderItemsTable).values(
        lineItems.map(li => ({ ...li, orderId: created.id, id: undefined }))
      );
    }
    res.status(201).json({ item: created });
  } catch (e) { next(e); }
});

router.patch("/purchase-orders/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });
    const { lineItems, ...orderData } = req.body as { lineItems?: typeof purchaseOrderItemsTable.$inferSelect[]; [k: string]: unknown };
    const khoiLuongTong = String(
      (lineItems ?? []).reduce((acc, li) => acc + (parseFloat(String(li.khoiLuong)) || 0), 0)
    );
    const parsed = insertPurchaseOrderSchema.partial().safeParse({ ...orderData, khoiLuongTong });
    if (!parsed.success) return res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    const [updated] = await db.update(purchaseOrdersTable).set({ ...parsed.data, updatedAt: new Date() }).where(eq(purchaseOrdersTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    if (lineItems) {
      await db.delete(purchaseOrderItemsTable).where(eq(purchaseOrderItemsTable.orderId, id));
      if (lineItems.length) {
        await db.insert(purchaseOrderItemsTable).values(lineItems.map(li => ({ ...li, orderId: id, id: undefined })));
      }
    }
    res.json({ item: updated });
  } catch (e) { next(e); }
});

router.delete("/purchase-orders/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });
    const [deleted] = await db.delete(purchaseOrdersTable).where(eq(purchaseOrdersTable.id, id)).returning({ id: purchaseOrdersTable.id });
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
