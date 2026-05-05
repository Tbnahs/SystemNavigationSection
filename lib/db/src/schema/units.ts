import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const unitsTable = pgTable("units_of_measure", {
  id: serial("id").primaryKey(),
  enterpriseId: integer("enterprise_id"),
  name: text("name").notNull(),
  abbreviation: text("abbreviation").notNull(),
  description: text("description").default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUnitSchema = createInsertSchema(unitsTable, {
  name: (s) => s.min(1, "Tên đơn vị bắt buộc"),
  abbreviation: (s) => s.min(1, "Ký hiệu bắt buộc"),
}).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertUnit = z.infer<typeof insertUnitSchema>;
export type Unit = typeof unitsTable.$inferSelect;
