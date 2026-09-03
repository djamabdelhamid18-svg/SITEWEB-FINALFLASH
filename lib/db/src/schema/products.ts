import { pgTable, serial, text, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  price: integer("price").notNull(),
  badge: text("badge"),
  isOneOfOne: boolean("is_one_of_one").notNull().default(false),
  inStock: boolean("in_stock").notNull().default(true),
  stockCount: integer("stock_count").notNull().default(1),
  quality: text("quality"),
  conditionDetails: text("condition_details"),
  fabric: text("fabric"),
  fit: text("fit"),
  care: text("care"),
  description: text("description").notNull(),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  sizes: jsonb("sizes").$type<string[]>().notNull().default([]),
  colors: jsonb("colors").$type<Array<{ name: string; hex?: string; image?: string }>>().notNull().default([]),
  features: jsonb("features").$type<string[]>().notNull().default([]),
  measurements: jsonb("measurements").$type<Array<{ label: string; value: string }>>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type DbProduct = typeof productsTable.$inferSelect;
