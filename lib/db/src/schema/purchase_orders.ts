import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { enterprisesTable } from "./enterprises";
import { facilitiesTable } from "./facilities";
import { productsTable } from "./products";
import { gradesTable } from "./grades";

export const purchaseOrdersTable = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  maPhieu: text("ma_phieu").notNull(),
  enterpriseId: integer("enterprise_id").references(() => enterprisesTable.id, { onDelete: "set null" }),
  facilityId: integer("facility_id").references(() => facilitiesTable.id, { onDelete: "set null" }),
  facilityName: text("facility_name").default("").notNull(),
  diaChuThu: text("dia_chu_thu").default("").notNull(),
  maLoMe: text("ma_lo_me").default("").notNull(),
  ngayThu: text("ngay_thu").notNull(),
  status: text("status", { enum: ["draft", "confirmed", "cancelled"] })
    .default("draft")
    .notNull(),
  notes: text("notes").default("").notNull(),
  total: text("total").default("0").notNull(),
  lamTron: text("lam_tron").default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const purchaseOrderItemsTable = pgTable("purchase_order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .references(() => purchaseOrdersTable.id, { onDelete: "cascade" })
    .notNull(),
  productId: integer("product_id").references(() => productsTable.id, { onDelete: "set null" }),
  gradeId: integer("grade_id").references(() => gradesTable.id, { onDelete: "set null" }),
  productName: text("product_name").notNull(),
  gradeName: text("grade_name").default("").notNull(),
  qualityPercent: text("quality_percent").default("").notNull(),
  ghiChu: text("ghi_chu").default("").notNull(),
  khoiLuong: text("khoi_luong").notNull(),
  donGia: text("don_gia").notNull(),
  thanhTien: text("thanh_tien").notNull(),
  moTa: text("mo_ta").default("").notNull(),
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrdersTable, {
  maPhieu: (s) => s.min(1, "Mã phiếu bắt buộc"),
  ngayThu: (s) => s.min(1, "Ngày thu bắt buộc"),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertPurchaseOrderItemSchema = createInsertSchema(purchaseOrderItemsTable, {
  productName: (s) => s.min(1, "Tên sản phẩm bắt buộc"),
  khoiLuong: (s) => s.min(1, "Khối lượng bắt buộc"),
  donGia: (s) => s.min(1, "Đơn giá bắt buộc"),
  thanhTien: (s) => s.min(1, "Thành tiền bắt buộc"),
}).omit({ id: true });

export type PurchaseOrder = typeof purchaseOrdersTable.$inferSelect;
export type PurchaseOrderItem = typeof purchaseOrderItemsTable.$inferSelect;
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type InsertPurchaseOrderItem = z.infer<typeof insertPurchaseOrderItemSchema>;
