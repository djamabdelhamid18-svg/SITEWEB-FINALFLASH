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
