import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { enterprisesTable } from "./enterprises";
import { unitsTable } from "./units";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  enterpriseId: integer("enterprise_id").references(() => enterprisesTable.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  code: text("code").default("").notNull(),
  gtin: text("gtin").default("").notNull(),
  type: text("type", { enum: ["ban_thanh_pham", "thanh_pham_cuoi"] })
    .default("ban_thanh_pham")
    .notNull(),
  unitId: integer("unit_id").references(() => unitsTable.id, { onDelete: "set null" }),
  price: text("price").default("").notNull(),
  imageUrl: text("image_url").default("").notNull(),
  description: text("description").default("").notNull(),
  status: text("status", { enum: ["active", "inactive"] }).default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(productsTable, {
  name: (s) => s.min(1, "Tên thương phẩm bắt buộc"),
}).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
