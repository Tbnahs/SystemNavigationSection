import { pgTable, serial, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const enterprisesTable = pgTable("enterprises", {
  id: serial("id").primaryKey(),
  mst: text("mst").notNull(),
  ten: text("ten").notNull(),
  tenHienThi: text("ten_hien_thi").notNull(),
  daiDien: text("dai_dien").default("").notNull(),
  sdt: text("sdt").default("").notNull(),
  email: text("email").default("").notNull(),
  diaChi: text("dia_chi").default("").notNull(),
  tinh: text("tinh").default("Thái Nguyên").notNull(),
  xa: text("xa").default("").notNull(),
  modules: jsonb("modules").$type<("ERP" | "TXNG" | "VT")[]>().default([]).notNull(),
  status: text("status", { enum: ["active", "pending", "locked"] }).default("active").notNull(),
  logoColor: text("logo_color").default("bg-emerald-100 text-emerald-700").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEnterpriseSchema = createInsertSchema(enterprisesTable, {
  mst: (s) => s.min(1, "Mã số thuế bắt buộc"),
  ten: (s) => s.min(1, "Tên doanh nghiệp bắt buộc"),
  tenHienThi: (s) => s.min(1, "Tên hiển thị bắt buộc"),
}).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertEnterprise = z.infer<typeof insertEnterpriseSchema>;
export type Enterprise = typeof enterprisesTable.$inferSelect;
