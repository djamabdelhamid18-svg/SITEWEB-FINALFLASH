import { randomUUID } from "node:crypto";
import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, orderItemsTable, ordersTable } from "@workspace/db";
import { CreateOrderBody, CreateOrderResponse } from "@workspace/api-zod";

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
  const integerValues = [
    input.subtotal,
    input.deliveryFee,
    input.total,
    ...input.items.flatMap((item) => [item.productId, item.quantity, item.unitPrice]),
  ];
  const itemsSubtotal = input.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  if (!integerValues.every(Number.isInteger) || itemsSubtotal !== input.subtotal || input.total !== input.subtotal + input.deliveryFee) {
    req.log.warn("Rejected order with invalid numeric totals");
    res.status(400).json({ error: "The order totals are invalid." });
    return;
  }
  const orderNumber = `FF-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;

  // 1-of-1 piece stock collision defense (Carhartt Pants #2, Converse Vintage #3, Hard Rock #5)
  const ONE_OF_ONE_PRODUCT_IDS = [2, 3, 5];
  const requestedOneOfOnes = input.items.filter((it) => ONE_OF_ONE_PRODUCT_IDS.includes(it.productId));

  if (requestedOneOfOnes.length > 0) {
    for (const item of requestedOneOfOnes) {
      const existingReservations = await db
        .select({ id: orderItemsTable.id })
        .from(orderItemsTable)
        .innerJoin(ordersTable, eq(orderItemsTable.orderId, ordersTable.id))
        .where(eq(orderItemsTable.productId, item.productId));

      if (existingReservations.length > 0) {
        req.log.warn({ productId: item.productId, title: item.productTitle }, "Prevented double-order on 1-of-1 piece");
        res.status(409).json({
          error: `عذراً، قطعة "${item.productTitle}" هي قطعة وحيدة (1 of 1) وتم حجزها مسبقاً.`,
          code: "ITEM_ALREADY_RESERVED",
        });
        return;
      }
    }
  }

  const order = await db.transaction(async (tx) => {
    const [created] = await tx.insert(ordersTable).values({
      orderNumber,
      customerName: input.customerName.trim(),
      phone: normalizedPhone,
      wilaya: input.wilaya.trim(),
      commune: input.commune.trim(),
      deliveryMethod: input.deliveryMethod,
      subtotal: input.subtotal,
      deliveryFee: input.deliveryFee,
      total: input.total,
      status: "new",
    }).returning();

    await tx.insert(orderItemsTable).values(input.items.map((item) => ({
      orderId: created.id,
      productId: item.productId,
      productTitle: item.productTitle.trim(),
      size: item.size.trim(),
      color: item.color?.trim() || null,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })));

    return created;
  });

  req.log.info({ orderId: order.id, orderNumber: order.orderNumber }, "Order created");
  res.status(201).json(CreateOrderResponse.parse({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    createdAt: order.createdAt,
  }));
});

// Admin Authorization Middleware to prevent public scraping of customer personal data
function adminAuthMiddleware(req: any, res: any, next: any): void {
  const adminKey = req.headers["x-admin-key"] || req.headers["authorization"]?.replace(/^Bearer\s+/i, "");
  const expectedKey = process.env.ADMIN_KEY || "FINAL2026";
  if (!adminKey || adminKey !== expectedKey) {
    res.status(401).json({
      error: "Unauthorized: Admin access key required to view or update customer orders.",
      code: "UNAUTHORIZED_ADMIN_ACCESS",
    });
    return;
  }
  next();
}

router.get("/orders", adminAuthMiddleware, async (req, res): Promise<void> => {
  try {
    const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
    const items = await db.select().from(orderItemsTable);
    const ordersWithItems = orders.map((ord) => ({
      ...ord,
      items: items.filter((item) => item.orderId === ord.id),
    }));
    res.json(ordersWithItems);
  } catch (err) {
    req.log.warn({ err }, "Failed to fetch orders from database");
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

router.patch("/orders/:id/status", adminAuthMiddleware, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;
  if (!id || typeof status !== "string") {
    res.status(400).json({ error: "Invalid status update" });
    return;
  }
  try {
    const [updated] = await db
      .update(ordersTable)
      .set({ status })
      .where(eq(ordersTable.id, id))
      .returning();
    res.json(updated);
  } catch (err) {
    req.log.warn({ err }, "Failed to update order status");
    res.status(500).json({ error: "Failed to update order status" });
  }
});

export default router;