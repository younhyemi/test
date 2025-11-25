import { sql } from "drizzle-orm";
import { pgTable, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// MENU 테이블
export const menus = pgTable("menus", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  menuName: varchar("menu_name", { length: 255 }).notNull(),
  price: integer("price").notNull(),
  saleYn: varchar("sale_yn", { length: 1 }).notNull().default('Y'), // Y: 판매중, N: 마감
});

export const insertMenuSchema = createInsertSchema(menus).omit({
  id: true,
  saleYn: true,
}).extend({
  menuName: z.string().min(1, "메뉴명을 입력해주세요"),
  price: z.number().min(0, "가격은 0원 이상이어야 합니다").int("가격은 정수만 입력 가능합니다"),
});

export type InsertMenu = z.infer<typeof insertMenuSchema>;
export type Menu = typeof menus.$inferSelect;

// ORDER 테이블
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tableNo: varchar("table_no", { length: 255 }).notNull(), // 테이블번호
  menuName: varchar("menu_name", { length: 255 }).notNull(),
  price: integer("price").notNull(),
  qty: integer("qty").notNull(),
  serveYn: varchar("serve_yn", { length: 1 }).notNull().default('N'), // Y: 제공완료, N: 미제공
  payYn: varchar("pay_yn", { length: 1 }).notNull().default('N'), // Y: 결제완료, N: 미결제
  useYn: varchar("use_yn", { length: 1 }).notNull().default('Y'), // Y: 사용중, N: 취소됨
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  serveYn: true,
  payYn: true,
  useYn: true,
  createdAt: true,
}).extend({
  tableNo: z.string().min(1, "테이블번호를 입력해주세요"),
  menuName: z.string().min(1, "메뉴명이 필요합니다"),
  price: z.number().int().min(0),
  qty: z.number().int().min(1, "수량은 1개 이상이어야 합니다"),
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
