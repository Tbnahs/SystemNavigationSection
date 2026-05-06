import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const gradesTable = pgTable("grades", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: text("price").default("").notNull(),
  prices: text("prices").default("[]").notNull(),
  loaiChe: text("loai_che").default("Chè xanh").notNull(),
  ghiChu: text("ghi_chu").default("").notNull(),
  colorKey: text("color_key").default("emerald").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const qualityLevelsTable = pgTable("quality_levels", {
  id: serial("id").primaryKey(),
  gradeId: integer("grade_id").references(() => gradesTable.id, { onDelete: "cascade" }),
  danhGia: text("danh_gia").notNull(),
  donGia: text("don_gia").notNull(),
  prices: text("prices").default("[]").notNull(),
  ghiChu: text("ghi_chu").default("").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const standardsTable = pgTable("standards", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").default("").notNull(),
  colorKey: text("color_key").default("emerald").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertGradeSchema = createInsertSchema(gradesTable, {
  name: (s) => s.min(1, "Tên quy cách bắt buộc"),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertQualityLevelSchema = createInsertSchema(qualityLevelsTable, {
  danhGia: (s) => s.min(1, "Đánh giá bắt buộc"),
  donGia: (s) => s.min(1, "Đơn giá bắt buộc"),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const insertStandardSchema = createInsertSchema(standardsTable, {
  title: (s) => s.min(1, "Tiêu đề bắt buộc"),
}).omit({ id: true, createdAt: true, updatedAt: true });

export type Grade = typeof gradesTable.$inferSelect;
export type QualityLevel = typeof qualityLevelsTable.$inferSelect;
export type Standard = typeof standardsTable.$inferSelect;
export type InsertGrade = z.infer<typeof insertGradeSchema>;
export type InsertQualityLevel = z.infer<typeof insertQualityLevelSchema>;
export type InsertStandard = z.infer<typeof insertStandardSchema>;
