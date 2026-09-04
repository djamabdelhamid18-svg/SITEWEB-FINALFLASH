import { randomUUID } from "node:crypto";
import { Router, type IRouter } from "express";
import { desc, eq, sql } from "drizzle-orm";
import { db, inventoryReservationsTable, orderAuditLogsTable, orderItemsTable, ordersTable } from "@workspace/db";
import { CreateOrderBody, CreateOrderResponse } from "@workspace/api-zod";
import {
  OFFICIAL_PRODUCT_CATALOG,
  calculateAuthoritativeDeliveryFee,
  validateOrderItem,
  VALID_ORDER_STATUSES,
  verifyAtomicReservationClaim,
} from "../business-logic";
import { sendTelegramOrderNotification } from "../services/telegram";

const router: IRouter = Router();

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.flatten() }, "Invalid order payload");
    res.status(400).json({ error: "Please check the order details and try again." });
    return;
  }

  const input = parsed.data;
  const normalizedPhone = input.phone.replace(/[\s()-]/g, "");
  if (!/^0[567]\d{8}$/.test(normalizedPhone) && !/^\+213[567]\d{8}$/.test(normalizedPhone)) {
    req.log.warn("Rejected order with invalid Algerian phone number");
    res.status(400).json({ error: "Please enter a valid Algerian phone number." });
    return;
  }

  // 1. Server-Authoritative Price, Attribute & Quantity Verification
  for (const item of input.items) {
    const catalogItem = OFFICIAL_PRODUCT_CATALOG[item.productId];
    if (!catalogItem) {
      req.log.warn({ productId: item.productId }, "Rejected order with unknown product ID");
      res.status(400).json({ error: `Unknown product ID: ${item.productId}` });
      return;
    }
    if (item.unitPrice !== catalogItem.price) {
      req.log.warn(
        { productId: item.productId, submittedPrice: item.unitPrice, catalogPrice: catalogItem.price },
        "Rejected order with tampered unit price"
      );
      res.status(400).json({
        error: `Price mismatch for "${item.productTitle}". The official catalog price is ${catalogItem.price} DA.`,
      });
      return;
    }
    // Enforce quantity=1 for 1-of-1 pieces — cannot buy 2 of a unique item
    if (catalogItem.isOneOfOne && item.quantity !== 1) {
      req.log.warn({ productId: item.productId, quantity: item.quantity }, "Rejected: quantity > 1 for 1-of-1 item");
      res.status(400).json({
        error: `"${item.productTitle}" is a unique 1-of-1 piece. Quantity must be 1.`,
        code: "INVALID_QUANTITY_FOR_UNIQUE_ITEM",
      });
      return;
    }
    // Validate size is in the allowed list for this product
    if (!catalogItem.validSizes.includes(item.size)) {
      req.log.warn({ productId: item.productId, size: item.size }, "Rejected order with invalid size");
      res.status(400).json({
        error: `Invalid size "${item.size}" for product "${item.productTitle}". Allowed: ${catalogItem.validSizes.join(", ")}.`,
        code: "INVALID_SIZE",
      });
      return;
    }
    // Validate color if provided
    if (item.color && !catalogItem.validColors.includes(item.color)) {
      req.log.warn({ productId: item.productId, color: item.color }, "Rejected order with invalid color");
      res.status(400).json({
        error: `Invalid color "${item.color}" for product "${item.productTitle}". Allowed: ${catalogItem.validColors.join(", ")}.`,
        code: "INVALID_COLOR",
      });
      return;
    }
  }

  const calculatedSubtotal = input.items.reduce(
    (sum, item) => sum + OFFICIAL_PRODUCT_CATALOG[item.productId].price * item.quantity,
    0
  );
  const calculatedDeliveryFee = calculateAuthoritativeDeliveryFee(input.wilaya, input.deliveryMethod);
  const calculatedTotal = calculatedSubtotal + calculatedDeliveryFee;

  if (
    input.subtotal !== calculatedSubtotal ||
    input.deliveryFee !== calculatedDeliveryFee ||
    input.total !== calculatedTotal
  ) {
    req.log.warn(
      {
        submitted: { subtotal: input.subtotal, fee: input.deliveryFee, total: input.total },
        calculated: { subtotal: calculatedSubtotal, fee: calculatedDeliveryFee, total: calculatedTotal },
      },
      "Rejected order with manipulated totals"
    );
    res.status(400).json({
      error: "Order financial calculations do not match server catalog.",
    });
    return;
  }

  const orderNumber = `FF-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;

  // 2. Atomic 1-of-1 Inventory Reservation with Database Unique Constraint + 60-min TTL
  try {
    const order = await db.transaction(async (tx) => {
      const requestedOneOfOnes = input.items.filter(
        (it) => OFFICIAL_PRODUCT_CATALOG[it.productId]?.isOneOfOne
      );

      // Check for existing *non-expired* active reservations via raw SQL
      // This is the correct approach: checks expires_at > NOW() atomically in the transaction
      for (const item of requestedOneOfOnes) {
        const activeReservation = await tx.execute(
          sql`SELECT id FROM inventory_reservations WHERE product_id = ${item.productId} AND expires_at > NOW() LIMIT 1`
        );
        if ((activeReservation as any).rows?.length > 0) {
          throw new Error(`ITEM_ALREADY_RESERVED:${item.productTitle}`);
        }
      }

      const [created] = await tx.insert(ordersTable).values({
        orderNumber,
        customerName: input.customerName.trim(),
        phone: normalizedPhone,
        wilaya: input.wilaya.trim(),
        commune: input.commune.trim(),
        deliveryMethod: input.deliveryMethod,
        subtotal: calculatedSubtotal,
        deliveryFee: calculatedDeliveryFee,
        total: calculatedTotal,
        status: "new",
      }).returning();

      await tx.insert(orderItemsTable).values(input.items.map((item) => ({
        orderId: created.id,
        productId: item.productId,
        productTitle: item.productTitle.trim(),
        size: item.size.trim(),
        color: item.color?.trim() || null,
        quantity: item.quantity,
        unitPrice: OFFICIAL_PRODUCT_CATALOG[item.productId].price,
      })));

      // Insert reservations with 60-minute TTL expiry
      // CRITICAL CONCURRENCY FIX:
      // DO NOT use plain "ON CONFLICT DO NOTHING" because if a concurrent order races,
      // Postgres will silently ignore the insert, returning 0 rows, which would allow the 2nd
      // order to commit without holding a reservation!
      // We use ON CONFLICT (product_id) DO UPDATE ... WHERE expires_at < NOW() RETURNING id
      // If the row is currently held by an active non-expired reservation, 0 rows are returned.
      // verifyAtomicReservationClaim then immediately throws ITEM_ALREADY_RESERVED, aborting
      // and rolling back this entire transaction cleanly!
      const reservationExpiry = new Date(Date.now() + 60 * 60 * 1000);
      for (const item of requestedOneOfOnes) {
        const reservationResult = await tx.execute(
          sql`INSERT INTO inventory_reservations (product_id, order_id, expires_at)
              VALUES (${item.productId}, ${created.id}, ${reservationExpiry})
              ON CONFLICT (product_id)
              DO UPDATE SET
                order_id = EXCLUDED.order_id,
                expires_at = EXCLUDED.expires_at,
                created_at = NOW()
              WHERE inventory_reservations.expires_at < NOW()
              RETURNING id`
        );

        verifyAtomicReservationClaim((reservationResult as any).rows, item.productTitle);
      }

      // Record audit log entry for order creation
      await tx.insert(orderAuditLogsTable).values({
        orderId: created.id,
        action: "order_created",
        newStatus: "new",
        changedBy: "storefront_checkout",
        notes: "طلب جديد عبر المتجر",
      });

      return created;
    });

    req.log.info({ orderId: order.id, orderNumber: order.orderNumber }, "Order created successfully");
    res.status(201).json(CreateOrderResponse.parse({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      createdAt: order.createdAt,
    }));

    // Non-blocking Telegram alert for store management (fire & forget)
    sendTelegramOrderNotification(
      {
        orderNumber: order.orderNumber,
        customerName: input.customerName.trim(),
        phone: normalizedPhone,
        wilaya: input.wilaya.trim(),
        commune: input.commune.trim(),
        deliveryMethod: input.deliveryMethod,
        subtotal: calculatedSubtotal,
        deliveryFee: calculatedDeliveryFee,
        total: calculatedTotal,
        items: input.items.map((it) => ({
          productTitle: it.productTitle,
          size: it.size,
          color: it.color,
          quantity: it.quantity,
          unitPrice: OFFICIAL_PRODUCT_CATALOG[it.productId].price,
        })),
      },
      req.log
    ).catch((err) => {
      req.log.error({ err }, "Unhandled error while dispatching Telegram notification");
    });
  } catch (err: any) {
    const isUniqueViolation =
      err?.code === "23505" ||
      err?.message?.includes("inventory_reservations_product_id_unique") ||
      err?.message?.startsWith("ITEM_ALREADY_RESERVED:");

    if (isUniqueViolation) {
      const pieceTitle = err?.message?.startsWith("ITEM_ALREADY_RESERVED:")
        ? err.message.replace("ITEM_ALREADY_RESERVED:", "")
        : "القطعة النادرة";
      req.log.warn({ pieceTitle }, "Atomic inventory conflict prevented by unique constraint");
      res.status(409).json({
        error: `عذراً، قطعة "${pieceTitle}" هي قطعة وحيدة (1 of 1) وتم حجزها للتو من زبون آخر.`,
        code: "ITEM_ALREADY_RESERVED",
      });
      return;
    }

    req.log.error({ err }, "Database transaction failed during order creation");
    res.status(500).json({ error: "Failed to persist order in database. Please try again or confirm via WhatsApp." });
  }
});

// Admin Authorization Middleware (Strict Environment Variable Enforcement - No Hardcoded Fallback)
function adminAuthMiddleware(req: any, res: any, next: any): void {
  const configuredAdminKey = process.env.ADMIN_KEY;
  if (!configuredAdminKey) {
    req.log.error("Security alert: ADMIN_KEY environment variable is not configured. Blocking admin endpoint.");
    res.status(500).json({
      error: "Server configuration error: Admin authentication key is not configured in environment.",
      code: "ADMIN_AUTH_NOT_CONFIGURED",
    });
    return;
  }

  const providedKey = req.headers["x-admin-key"] || req.headers["authorization"]?.replace(/^Bearer\s+/i, "");
  if (!providedKey || providedKey !== configuredAdminKey) {
    req.log.warn("Unauthorized attempt to access admin orders endpoint");
    res.status(401).json({
      error: "Unauthorized: Valid admin access key required to view customer orders.",
      code: "UNAUTHORIZED_ADMIN_ACCESS",
    });
    return;
  }

  next();
}

router.get("/orders", adminAuthMiddleware, async (req, res): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const statusFilter = req.query.status as string;
    const searchQuery = (req.query.q || req.query.search) as string;

    let allOrders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
    if (statusFilter && statusFilter !== "all") {
      allOrders = allOrders.filter((o) => o.status === statusFilter);
    }
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      allOrders = allOrders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.phone.includes(q) ||
          o.wilaya.toLowerCase().includes(q) ||
          o.commune.toLowerCase().includes(q)
      );
    }

    const total = allOrders.length;
    const isPaginated = req.query.paginate === "true" || req.query.page !== undefined;
    const paginatedOrders = isPaginated
      ? allOrders.slice((page - 1) * limit, page * limit)
      : allOrders;

    const items = await db.select().from(orderItemsTable);
    const ordersWithItems = paginatedOrders.map((ord) => ({
      ...ord,
      items: items.filter((item) => item.orderId === ord.id),
    }));

    if (isPaginated) {
      res.json({
        orders: ordersWithItems,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      });
    } else {
      res.json(ordersWithItems);
    }
  } catch (err) {
    req.log.warn({ err }, "Failed to fetch orders from database");
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

router.patch("/orders/:id/status", adminAuthMiddleware, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const { status, notes } = req.body;
  if (!id || typeof status !== "string" || !VALID_ORDER_STATUSES.includes(status as any)) {
    res.status(400).json({
      error: `Invalid status. Allowed statuses are: ${VALID_ORDER_STATUSES.join(", ")}`,
      code: "INVALID_STATUS_VALUE",
    });
    return;
  }

  try {
    const existing = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
    if (existing.length === 0) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    const previousStatus = existing[0].status;

    const [updated] = await db
      .update(ordersTable)
      .set({ status })
      .where(eq(ordersTable.id, id))
      .returning();

    // Record audit log for status change
    await db.insert(orderAuditLogsTable).values({
      orderId: id,
      action: "status_change",
      previousStatus,
      newStatus: status,
      changedBy: "admin",
      notes: typeof notes === "string" ? notes.trim() : null,
    });

    // If order is cancelled, immediately delete its inventory reservation to liberate the 1-of-1 piece
    if (status === "cancelled") {
      await db.delete(inventoryReservationsTable).where(eq(inventoryReservationsTable.orderId, id));
      req.log.info({ orderId: id }, "Liberated 1-of-1 inventory reservations for cancelled order");
    }

    res.json(updated);
  } catch (err) {
    req.log.warn({ err }, "Failed to update order status");
    res.status(500).json({ error: "Failed to update order status" });
  }
});

router.get("/orders/:id/audit-logs", adminAuthMiddleware, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (!id) {
    res.status(400).json({ error: "Invalid order ID" });
    return;
  }
  try {
    const logs = await db
      .select()
      .from(orderAuditLogsTable)
      .where(eq(orderAuditLogsTable.orderId, id))
      .orderBy(desc(orderAuditLogsTable.createdAt));
    res.json(logs);
  } catch (err) {
    req.log.warn({ err }, "Failed to fetch audit logs");
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});

export default router;