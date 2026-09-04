/**
 * Pure business logic — no database imports, no Express.
 * Exported from here so tests can import directly without needing DATABASE_URL.
 */

export type CatalogItem = {
  price: number;
  isOneOfOne: boolean;
  validSizes: readonly string[];
  validColors: readonly string[];
  title: string;
};

export const OFFICIAL_PRODUCT_CATALOG: Record<number, CatalogItem> = {
  1: {
    price: 2900,
    isOneOfOne: false,
    validSizes: ["M", "L", "XL"],
    validColors: ["Black", "Grey", "أسود", "رمادي"],
    title: "Baggy Jogger",
  },
  2: {
    price: 2000,
    isOneOfOne: true,
    validSizes: ["S"],
    validColors: ["Onyx Black", "أسود"],
    title: "Thrifted Gymshark T-Shirt",
  },
  3: {
    price: 2400,
    isOneOfOne: true,
    validSizes: ["M"],
    validColors: ["Navy Blue", "أزرق داكن"],
    title: "Vintage Hard Rock Cafe Tee",
  },
  4: {
    price: 4300,
    isOneOfOne: false,
    validSizes: ["Set Customizer", "M", "L", "XL"],
    validColors: ["Black Set", "Grey Set", "أسود", "رمادي"],
    title: "The Finalflash Street Set",
  },
  5: {
    price: 4500,
    isOneOfOne: true,
    validSizes: ["W32-34"],
    validColors: ["Duck Brown", "بني"],
    title: "Carhartt Vintage Baggy Pants",
  },
  6: {
    price: 5200,
    isOneOfOne: true,
    validSizes: ["EU 42", "42"],
    validColors: ["Optical White", "أبيض"],
    title: "Converse All Star High 1990s",
  },
};

export const VALID_ORDER_STATUSES = [
  "new",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
] as const;

// Delivery zones by wilaya number
const ALGER_WILAYAS = new Set(["16"]);
const CENTER_NORTH_WILAYAS = new Set([
  "09", "35", "42", "10", "15", "26", "31", "25", "23", "06", "18", "13", "27",
]);
const SOUTH_WILAYAS = new Set([
  "01", "08", "11", "30", "33", "37", "47", "49", "50", "52", "53", "54", "56", "58",
]);

/**
 * Extracts wilaya number strictly from the START of the string.
 * "11 - Tamanrasset 16" → "11" (NOT "16")
 */
export function extractWilayaNumber(wilaya: string): string | null {
  const match = wilaya.trim().match(/^(\d{2})\b/);
  return match ? match[1] : null;
}

export function calculateAuthoritativeDeliveryFee(
  wilaya: string,
  method: "home" | "desk"
): number {
  if (!wilaya) return method === "home" ? 600 : 400;
  const num = extractWilayaNumber(wilaya);
  if (!num) return method === "home" ? 700 : 450;
  if (ALGER_WILAYAS.has(num)) return method === "home" ? 400 : 250;
  if (CENTER_NORTH_WILAYAS.has(num)) return method === "home" ? 600 : 400;
  if (SOUTH_WILAYAS.has(num)) return method === "home" ? 950 : 650;
  return method === "home" ? 700 : 450;
}

export function validateOrderItem(
  item: { productId: number; unitPrice: number; quantity: number; size: string; color?: string }
): { valid: true } | { valid: false; code: string; message: string } {
  const catalog = OFFICIAL_PRODUCT_CATALOG[item.productId as keyof typeof OFFICIAL_PRODUCT_CATALOG];
  if (!catalog) {
    return { valid: false, code: "UNKNOWN_PRODUCT", message: `Unknown product ID: ${item.productId}` };
  }
  if (item.unitPrice !== catalog.price) {
    return {
      valid: false,
      code: "PRICE_TAMPERED",
      message: `Price mismatch: submitted ${item.unitPrice}, catalog ${catalog.price}`,
    };
  }
  if (catalog.isOneOfOne && item.quantity !== 1) {
    return {
      valid: false,
      code: "INVALID_QUANTITY_FOR_UNIQUE_ITEM",
      message: `"${catalog.title}" is 1-of-1: quantity must be 1, got ${item.quantity}`,
    };
  }
  if (!catalog.validSizes.includes(item.size as never)) {
    return {
      valid: false,
      code: "INVALID_SIZE",
      message: `Invalid size "${item.size}" for "${catalog.title}". Allowed: ${catalog.validSizes.join(", ")}`,
    };
  }
  if (item.color && !catalog.validColors.includes(item.color as never)) {
    return {
      valid: false,
      code: "INVALID_COLOR",
      message: `Invalid color "${item.color}" for "${catalog.title}". Allowed: ${catalog.validColors.join(", ")}`,
    };
  }
  return { valid: true };
}

/**
 * Evaluates the result of a PostgreSQL atomic reservation upsert:
 * INSERT INTO inventory_reservations ... ON CONFLICT (product_id) DO UPDATE ... WHERE expires_at < NOW() RETURNING id
 * 
 * If PostgreSQL returned 0 rows, it means an active (non-expired) reservation
 * already held the row. In that case, we MUST throw ITEM_ALREADY_RESERVED so the transaction rolls back.
 */
export function verifyAtomicReservationClaim(
  rows: Array<{ id: number }> | undefined,
  productTitle: string
): { success: true; reservationId: number } {
  if (!rows || rows.length === 0) {
    throw new Error(`ITEM_ALREADY_RESERVED:${productTitle}`);
  }
  return { success: true, reservationId: rows[0].id };
}

/**
 * High-concurrency Atomic Reservation Simulator
 * Accurately models PostgreSQL row-level mutex, ON CONFLICT DO UPDATE ... WHERE expires_at < NOW() RETURNING id,
 * and TTL expirations under concurrent asynchronous race conditions.
 */
export class AtomicReservationSimulator {
  private reservations = new Map<number, { orderId: number; expiresAt: number }>();
  private locks = new Map<number, Promise<void>>();

  async claim(
    productId: number,
    orderId: number,
    productTitle: string,
    ttlMs: number = 60 * 60 * 1000
  ): Promise<{ success: true; orderId: number }> {
    // Wait for any in-flight transaction on this productId (simulating Postgres row-level lock)
    while (this.locks.has(productId)) {
      await this.locks.get(productId);
    }

    let releaseLock: () => void = () => {};
    const lockPromise = new Promise<void>((resolve) => {
      releaseLock = resolve;
    });
    this.locks.set(productId, lockPromise);

    try {
      // Simulate real asynchronous DB transaction latency (1-10ms)
      await new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * 10) + 1));

      const now = Date.now();
      const existing = this.reservations.get(productId);

      let returnedRows: Array<{ id: number }> = [];

      if (!existing || existing.expiresAt <= now) {
        // No conflict OR expired reservation: Claim succeeds, returns 1 row
        this.reservations.set(productId, { orderId, expiresAt: now + ttlMs });
        returnedRows = [{ id: orderId }];
      } else {
        // Conflict with active reservation: Postgres WHERE condition fails, returns 0 rows!
        returnedRows = [];
      }

      // Check results: if 0 rows returned, throw ITEM_ALREADY_RESERVED (rolls back transaction)
      verifyAtomicReservationClaim(returnedRows, productTitle);

      return { success: true, orderId };
    } finally {
      this.locks.delete(productId);
      releaseLock();
    }
  }

  isReserved(productId: number): boolean {
    const r = this.reservations.get(productId);
    return !!r && r.expiresAt > Date.now();
  }
}
