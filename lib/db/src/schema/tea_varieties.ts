import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { productsTable } from "./products";

export const teaVarietiesTable = pgTable("tea_varieties", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").default("").notNull(),
  notes: text("notes").default("").notNull(),
  productId: integer("product_id").references(() => productsTable.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTeaVarietySchema = createInsertSchema(teaVarietiesTable, {
  name: (s) => s.min(1, "Tên giống chè bắt buộc"),
}).omit({ id: true, createdAt: true, updatedAt: true });

export type TeaVariety = typeof teaVarietiesTable.$inferSelect;
export type InsertTeaVariety = z.infer<typeof insertTeaVarietySchema>;
