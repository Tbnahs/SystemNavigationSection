import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { enterprisesTable } from "./enterprises";

export const employeesTable = pgTable("employees", {
  id: serial("id").primaryKey(),
  enterpriseId: integer("enterprise_id")
    .references(() => enterprisesTable.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  email: text("email").default("").notNull(),
  phone: text("phone").default("").notNull(),
  role: text("role")
    .default("Nhân viên")
    .notNull(),
  status: text("status", { enum: ["active", "invited", "locked"] })
    .default("invited")
    .notNull(),
  avatarColor: text("avatar_color").default("bg-emerald-500").notNull(),
  lastSeen: text("last_seen").default("Chưa đăng nhập").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEmployeeSchema = createInsertSchema(employeesTable, {
  name: (s) => s.min(1, "Họ tên bắt buộc"),
}).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employeesTable.$inferSelect;
