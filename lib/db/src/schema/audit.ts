import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { ordersTable } from "./orders";

export const orderAuditLogsTable = pgTable("order_audit_logs", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => ordersTable.id, { onDelete: "cascade" }),
  action: text("action").notNull(), // 'status_change', 'created', 'cancelled'
  previousStatus: text("previous_status"),
  newStatus: text("new_status").notNull(),
  changedBy: text("changed_by").notNull().default("admin"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type OrderAuditLog = typeof orderAuditLogsTable.$inferSelect;
