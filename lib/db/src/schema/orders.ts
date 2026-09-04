import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  wilaya: text("wilaya").notNull(),
  commune: text("commune").notNull().default(""),
  deliveryMethod: text("delivery_method").notNull(),
  subtotal: integer("subtotal").notNull(),
  deliveryFee: integer("delivery_fee").notNull(),
  total: integer("total").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const orderItemsTable = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => ordersTable.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull(),
  productTitle: text("product_title").notNull(),
  size: text("size").notNull(),
  color: text("color"),
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(),
});

export const inventoryReservationsTable = pgTable("inventory_reservations", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().unique(), // UNIQUE: prevents selling same 1-of-1 twice
  orderId: integer("order_id").notNull().references(() => ordersTable.id, { onDelete: "cascade" }), // NO unique — one order can reserve multiple 1-of-1 pieces
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(), // auto-release if unpaid
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItemsTable).omit({ id: true });

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItemsTable.$inferSelect;
export type InventoryReservation = typeof inventoryReservationsTable.$inferSelect;