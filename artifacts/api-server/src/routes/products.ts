import { Router, type IRouter, type Request, type Response } from "express";
import { db, productsTable, inventoryReservationsTable } from "@workspace/db";
import { sql, eq, desc } from "drizzle-orm";
import { adminAuthMiddleware } from "../middlewares/admin-auth";
import { ensureProductsSeeded, DEFAULT_SEED_PRODUCTS } from "../services/products-seed";

const router: IRouter = Router();

/**
 * GET /api/products
 * Fetches all store products from PostgreSQL.
 * Dynamically correlates with inventory_reservations to compute live isReserved & inStock status!
 */
router.get("/products", async (_req: Request, res: Response): Promise<void> => {
  try {
    await ensureProductsSeeded();

    // Query active non-expired reservations
    let activeReservedIds = new Set<number>();
    try {
      const activeResQuery = await db.execute(
        sql`SELECT product_id FROM inventory_reservations WHERE expires_at > NOW()`
      );
      const rows = (activeResQuery as any)?.rows || [];
      for (const r of rows) {
        if (r.product_id != null) {
          activeReservedIds.add(Number(r.product_id));
        }
      }
    } catch {
      // If table not yet initialized, activeReservedIds remains empty
    }

    // Query products from database
    let productsList: any[] = [];
    try {
      productsList = await db.select().from(productsTable).orderBy(productsTable.id);
    } catch {
      // Fallback to seed catalog if database offline
      productsList = DEFAULT_SEED_PRODUCTS;
    }

    if (!productsList || productsList.length === 0) {
      productsList = DEFAULT_SEED_PRODUCTS;
    }

    // Attach real-time isReserved and inStock flags
    const enriched = productsList.map((p) => {
      const isReserved = activeReservedIds.has(p.id);
      const inStock = p.inStock && !(p.isOneOfOne && isReserved);
      return {
        ...p,
        isReserved,
        inStock,
      };
    });

    res.json(enriched);
  } catch (err) {
    // Graceful fallback to default seed so storefront never breaks
    res.json(
      DEFAULT_SEED_PRODUCTS.map((p) => ({
        ...p,
        isReserved: false,
        inStock: p.inStock,
      }))
    );
  }
});

/**
 * GET /api/products/:id
 * Fetches a single product with live reservation status.
 */
router.get("/products/:id", async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid product ID" });
    return;
  }

  try {
    await ensureProductsSeeded();

    let product: any = null;
    try {
      const [dbProd] = await db.select().from(productsTable).where(eq(productsTable.id, id));
      product = dbProd;
    } catch {
      product = DEFAULT_SEED_PRODUCTS.find((p) => p.id === id);
    }

    if (!product) {
      product = DEFAULT_SEED_PRODUCTS.find((p) => p.id === id);
    }

    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    // Check live reservation
    let isReserved = false;
    try {
      const resCheck = await db.execute(
        sql`SELECT id FROM inventory_reservations WHERE product_id = ${id} AND expires_at > NOW() LIMIT 1`
      );
      isReserved = ((resCheck as any)?.rows?.length || 0) > 0;
    } catch {}

    const inStock = product.inStock && !(product.isOneOfOne && isReserved);

    res.json({
      ...product,
      isReserved,
      inStock,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product details" });
  }
});

/**
 * POST /api/products
 * Admin-only: Adds a new thrift / streetwear piece to the PostgreSQL database.
 */
router.post("/products", adminAuthMiddleware, async (req: Request, res: Response): Promise<void> => {
  const body = req.body;

  if (!body.title || typeof body.title !== "string" || body.title.trim().length === 0) {
    res.status(400).json({ error: "Product title is required." });
    return;
  }

  const price = Number(body.price);
  if (isNaN(price) || price <= 0) {
    res.status(400).json({ error: "A valid positive price is required." });
    return;
  }

  const category = (body.category || "tshirts").trim();
  const isOneOfOne = Boolean(body.isOneOfOne);
  const inStock = body.inStock !== false;
  const stockCount = isOneOfOne ? 1 : Math.max(1, Number(body.stockCount) || 1);
  const badge = body.badge?.trim() || (isOneOfOne ? "THRIFT 1 OF 1" : "NEW ARRIVAL");

  const sizes = Array.isArray(body.sizes) && body.sizes.length > 0
    ? body.sizes
    : typeof body.sizes === "string"
    ? body.sizes.split(",").map((s: string) => s.trim()).filter(Boolean)
    : ["Free Size"];

  const colors = Array.isArray(body.colors) && body.colors.length > 0
    ? body.colors
    : typeof body.colors === "string"
    ? body.colors.split(",").map((c: string) => ({ name: c.trim() })).filter((c: any) => c.name)
    : [{ name: "Standard" }];

  const images = Array.isArray(body.images) && body.images.length > 0
    ? body.images
    : typeof body.image === "string" && body.image.trim()
    ? [body.image.trim()]
    : ["jogger-black.jpg"];

  const description = (body.description || `قطعة ستريت وير حصرية منتقاة بعناية لمتجر Finalflash.`).trim();
  const quality = body.quality?.trim() || (isOneOfOne ? "10/10 أصلي بحالة ممتازة" : "10/10 جديد");
  const conditionDetails = body.conditionDetails?.trim() || "قطعة مفحوصة ومغسولة بالبخار وجاهزة للمعاينة عند الاستلام.";
  const fabric = body.fabric?.trim() || "100% قطن عالي الجودة";
  const fit = body.fit?.trim() || "Streetwear Fit مريح";
  const care = body.care?.trim() || "غسيل بارد معتدل على 30 درجة مئوية";
  const features = Array.isArray(body.features) ? body.features : ["قطعة أصلية مضمونة", "حق المعاينة قبل الدفع"];
  const measurements = Array.isArray(body.measurements) ? body.measurements : [];

  try {
    await ensureProductsSeeded();

    const [created] = await db
      .insert(productsTable)
      .values({
        title: body.title.trim(),
        category,
        price,
        badge,
        isOneOfOne,
        inStock,
        stockCount,
        quality,
        conditionDetails,
        fabric,
        fit,
        care,
        description,
        images,
        sizes,
        colors,
        features,
        measurements,
      })
      .returning();

    req.log?.info?.({ productId: created.id, title: created.title }, "New product added successfully by admin");
    res.status(201).json(created);
  } catch (err) {
    req.log?.error?.({ err }, "Failed to insert product into database");
    res.status(500).json({ error: "Failed to save product in database." });
  }
});

/**
 * PATCH /api/products/:id
 * Admin-only: Updates product fields (e.g. stock, price, title).
 */
router.patch("/products/:id", adminAuthMiddleware, async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid product ID" });
    return;
  }

  const updates: any = {};
  if (req.body.inStock !== undefined) updates.inStock = Boolean(req.body.inStock);
  if (req.body.price !== undefined && !isNaN(Number(req.body.price))) updates.price = Number(req.body.price);
  if (req.body.stockCount !== undefined && !isNaN(Number(req.body.stockCount))) updates.stockCount = Number(req.body.stockCount);
  if (req.body.badge !== undefined) updates.badge = String(req.body.badge);
  if (req.body.title !== undefined) updates.title = String(req.body.title);

  try {
    const [updated] = await db
      .update(productsTable)
      .set(updates)
      .where(eq(productsTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update product." });
  }
});

export default router;
