import { pgTable, serial, text, timestamp, integer, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { enterprisesTable } from "./enterprises";
import { employeesTable } from "./employees";

export const facilitiesTable = pgTable("facilities", {
  id: serial("id").primaryKey(),
  enterpriseId: integer("enterprise_id").references(() => enterprisesTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  code: text("code").default("").notNull(),
  type: text("type", {
    enum: ["ho_lien_ket", "co_so_thue_ngoai", "co_so_noi_bo"],
  }).notNull().default("ho_lien_ket"),
  phone: text("phone").default("").notNull(),
  address: text("address").default("").notNull(),
  tinh: text("tinh").default("").notNull(),
  xa: text("xa").default("").notNull(),
  gln: text("gln").default("").notNull(),
  status: text("status", { enum: ["active", "inactive"] }).default("active").notNull(),
  notes: text("notes").default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const facilityEmployeesTable = pgTable(
  "facility_employees",
  {
    facilityId: integer("facility_id")
      .references(() => facilitiesTable.id, { onDelete: "cascade" })
      .notNull(),
    employeeId: integer("employee_id")
      .references(() => employeesTable.id, { onDelete: "cascade" })
      .notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.facilityId, t.employeeId] }) }),
);

export const insertFacilitySchema = createInsertSchema(facilitiesTable, {
  name: (s) => s.min(1, "Tên cơ sở bắt buộc"),
}).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertFacility = z.infer<typeof insertFacilitySchema>;
export type Facility = typeof facilitiesTable.$inferSelect;
