import { randomUUID } from "node:crypto";
import { Router, type IRouter } from "express";
import { and, desc, eq, ne } from "drizzle-orm";
import { db, orderItemsTable, ordersTable } from "@workspace/db";
import { CreateOrderBody, CreateOrderResponse } from "@workspace/api-zod";

const router: IRouter = Router();

// Official Authoritative Product Catalog (Server Source of Truth)
export const OFFICIAL_PRODUCT_CATALOG: Record<number, { price: number; isOneOfOne: boolean }> = {
  1: { price: 2900, isOneOfOne: false }, // Baggy Jogger
  2: { price: 2000, isOneOfOne: true },  // Thrifted Gymshark T-Shirt (1 of 1)
  3: { price: 2400, isOneOfOne: true },  // Vintage Hard Rock Cafe Tee (1 of 1)
  4: { price: 4300, isOneOfOne: false }, // The Finalflash Set (Bundle)
  5: { price: 4500, isOneOfOne: true },  // Carhartt Vintage Baggy Pants (1 of 1)
  6: { price: 5200, isOneOfOne: true },  // Converse All Star High 1990s (1 of 1)
};

// Official Authoritative Delivery Fee Matrix for 58 Algerian Wilayas
export function calculateAuthoritativeDeliveryFee(wilaya: string, method: "home" | "desk"): number {
  if (!wilaya) return method === "home" ? 600 : 400;

  const alger = ["16 - Alger", "16 - الجزائر العاصمة", "16"];
  const centerNorth = [
    "09 - Blida", "09 - البليدة", "09",
    "35 - Boumerdès", "35 - بومرداس", "35",
    "42 - Tipaza", "42 - تيبازة", "42",
    "10 - Bouira", "10 - البويرة", "10",
    "15 - Tizi Ouzou", "15 - تيزي وزو", "15",
    "26 - Médéa", "26 - المدية", "26",
    "31 - Oran", "31 - وهران", "31",
    "25 - Constantine", "25 - قسنطينة", "25",
    "23 - Annaba", "23 - عنابة", "23",
    "06 - Béjaïa", "06 - بجاية", "06",
    "18 - Jijel", "18 - جيجل", "18",
    "13 - Tlemcen", "13 - تلمسان", "13",
    "27 - Mostaganem", "27 - مستغانم", "27"
  ];
  const southBig = [
    "01 - Adrar", "01 - أدرار", "01",
    "08 - Béchar", "08 - بشار", "08",
    "11 - Tamanrasset", "11 - تمنراست", "11",
    "30 - Ouargla", "30 - ورقلة", "30",
    "33 - Illizi", "33 - إليزي", "33",
    "37 - Tindouf", "37 - تندوف", "37",
    "47 - Ghardaïa", "47 - غرداية", "47",
    "49 - Timimoun", "49 - تيميمون", "49",
    "50 - Bordj Badji Mokhtar", "50 - برج باجي مختار", "50",
    "52 - Béni Abbès", "52 - بني عباس", "52",
    "53 - In Salah", "53 - عين صالح", "53",
    "54 - In Guezzam", "54 - عين قزام", "54",
    "56 - Djanet", "56 - جانت", "56",
    "58 - El Meniaa", "58 - المنيعة", "58"
  ];

  if (alger.some(w => wilaya.includes(w))) {
    return method === "home" ? 400 : 250;
  }
  if (centerNorth.some(w => wilaya.includes(w))) {
    return method === "home" ? 600 : 400;
  }
  if (southBig.some(w => wilaya.includes(w))) {
    return method === "home" ? 950 : 650;
  }
  return method === "home" ? 700 : 450;
}

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

  // 1. Server-Authoritative Price & Fee Verification (Defending against client price tampering)
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

  // 2. Atomic 1-of-1 Inventory Reservation inside Transaction (Preventing Race Conditions)
  try {
    const order = await db.transaction(async (tx) => {
      // Check 1-of-1 pieces atomically inside transaction
      const requestedOneOfOnes = input.items.filter(
        (it) => OFFICIAL_PRODUCT_CATALOG[it.productId]?.isOneOfOne
      );

      for (const item of requestedOneOfOnes) {
        const existingActiveReservations = await tx
          .select({ id: orderItemsTable.id })
          .from(orderItemsTable)
          .innerJoin(ordersTable, eq(orderItemsTable.orderId, ordersTable.id))
          .where(
            and(
              eq(orderItemsTable.productId, item.productId),
              ne(ordersTable.status, "cancelled")
            )
          );

        if (existingActiveReservations.length > 0) {
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

      return created;
    });

    req.log.info({ orderId: order.id, orderNumber: order.orderNumber }, "Order created successfully");
    res.status(201).json(CreateOrderResponse.parse({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      createdAt: order.createdAt,
    }));
  } catch (err: any) {
    if (err?.message?.startsWith("ITEM_ALREADY_RESERVED:")) {
      const pieceTitle = err.message.replace("ITEM_ALREADY_RESERVED:", "");
      req.log.warn({ pieceTitle }, "Atomic inventory conflict prevented");
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