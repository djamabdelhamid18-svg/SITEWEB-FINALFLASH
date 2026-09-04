/**
 * Tests that import the REAL server business logic.
 * Deleting artifacts/api-server WILL break these tests — that is correct behavior.
 *
 * Run: node --experimental-strip-types --test tests/api-security-and-pricing.test.mjs
 */

import test from "node:test";
import assert from "node:assert/strict";

// Import real server logic — no mocks, no re-implementations
import {
  OFFICIAL_PRODUCT_CATALOG,
  calculateAuthoritativeDeliveryFee,
  extractWilayaNumber,
  validateOrderItem,
  VALID_ORDER_STATUSES,
} from "../artifacts/api-server/src/business-logic.ts";

// ─── 1. Wilaya Number Extraction ─────────────────────────────────────────────

test("extractWilayaNumber: extracts wilaya code from START of string only", async (t) => {
  await t.test("extracts '16' from '16 - Alger'", () => {
    assert.equal(extractWilayaNumber("16 - Alger"), "16");
  });

  await t.test("extracts '11' from '11 - Tamanrasset' — not '16' despite containing it later", () => {
    assert.equal(extractWilayaNumber("11 - Tamanrasset"), "11");
  });

  await t.test("SECURITY: '11 - Tamanrasset 16' must extract '11', not '16'", () => {
    // This is the exact attack vector Claude identified
    assert.equal(extractWilayaNumber("11 - Tamanrasset 16"), "11");
  });

  await t.test("returns null for strings that don't start with 2 digits", () => {
    assert.equal(extractWilayaNumber("Alger"), null);
    assert.equal(extractWilayaNumber(""), null);
  });
});

// ─── 2. Delivery Fee Matrix ───────────────────────────────────────────────────

test("Delivery Fee: Algiers (16) — correct rates and spoof-proof", async (t) => {
  await t.test("16 - Alger: home=400, desk=250", () => {
    assert.equal(calculateAuthoritativeDeliveryFee("16 - Alger", "home"), 400);
    assert.equal(calculateAuthoritativeDeliveryFee("16 - Alger", "desk"), 250);
    assert.equal(calculateAuthoritativeDeliveryFee("16 - الجزائر العاصمة", "home"), 400);
  });

  await t.test("SECURITY: '11 - Tamanrasset 16' must get south rate (950), NOT Algiers rate (400)", () => {
    const fee = calculateAuthoritativeDeliveryFee("11 - Tamanrasset 16", "home");
    assert.notEqual(fee, 400, "Price spoofing attack succeeded — critical bug!");
    assert.equal(fee, 950);
  });

  await t.test("SECURITY: '09 - Blida 16' must get center rate (600), NOT Algiers rate (400)", () => {
    const fee = calculateAuthoritativeDeliveryFee("09 - Blida 16", "home");
    assert.notEqual(fee, 400, "Price spoofing attack succeeded — critical bug!");
    assert.equal(fee, 600);
  });
});

test("Delivery Fee: Center/North wilayas (Oran, Blida, Tizi Ouzou, etc.)", async (t) => {
  const wilayas = [
    "09 - Blida", "35 - Boumerdès", "15 - Tizi Ouzou",
    "31 - Oran", "25 - Constantine", "23 - Annaba",
  ];
  for (const w of wilayas) {
    await t.test(`${w}: home=600 DA, desk=400 DA`, () => {
      assert.equal(calculateAuthoritativeDeliveryFee(w, "home"), 600);
      assert.equal(calculateAuthoritativeDeliveryFee(w, "desk"), 400);
    });
  }
});

test("Delivery Fee: South wilayas (Tamanrasset, Adrar, Illizi, etc.)", async (t) => {
  const wilayas = [
    "11 - Tamanrasset", "01 - Adrar", "33 - Illizi",
    "37 - Tindouf", "56 - Djanet",
  ];
  for (const w of wilayas) {
    await t.test(`${w}: home=950 DA, desk=650 DA`, () => {
      assert.equal(calculateAuthoritativeDeliveryFee(w, "home"), 950);
      assert.equal(calculateAuthoritativeDeliveryFee(w, "desk"), 650);
    });
  }
});

test("Delivery Fee: High plateau / other wilayas get 700/450 DA default", async (t) => {
  await t.test("Djelfa (17), El Oued (39), El Bayadh (32) get mid rate", () => {
    assert.equal(calculateAuthoritativeDeliveryFee("17 - Djelfa", "home"), 700);
    assert.equal(calculateAuthoritativeDeliveryFee("39 - El Oued", "desk"), 450);
    assert.equal(calculateAuthoritativeDeliveryFee("32 - El Bayadh", "home"), 700);
  });
});

// ─── 3. Order Item Validation ─────────────────────────────────────────────────

test("validateOrderItem: price tamper detection", async (t) => {
  await t.test("rejects tampered price (10 DA instead of 2900 DA)", () => {
    const result = validateOrderItem({ productId: 1, unitPrice: 10, quantity: 1, size: "M" });
    assert.equal(result.valid, false);
    assert.equal(result.code, "PRICE_TAMPERED");
  });

  await t.test("accepts correct price", () => {
    const result = validateOrderItem({ productId: 1, unitPrice: 2900, quantity: 1, size: "M" });
    assert.equal(result.valid, true);
  });
});

test("validateOrderItem: 1-of-1 quantity enforcement", async (t) => {
  await t.test("quantity=5 on Carhartt (1-of-1) is rejected", () => {
    const result = validateOrderItem({ productId: 5, unitPrice: 4500, quantity: 5, size: "W32-34" });
    assert.equal(result.valid, false);
    assert.equal(result.code, "INVALID_QUANTITY_FOR_UNIQUE_ITEM");
  });

  await t.test("quantity=1 on Carhartt (1-of-1) is accepted", () => {
    const result = validateOrderItem({ productId: 5, unitPrice: 4500, quantity: 1, size: "W32-34" });
    assert.equal(result.valid, true);
  });

  await t.test("quantity=3 on Baggy Jogger (not 1-of-1) is accepted", () => {
    const result = validateOrderItem({ productId: 1, unitPrice: 2900, quantity: 3, size: "L" });
    assert.equal(result.valid, true);
  });
});

test("validateOrderItem: size validation against catalog", async (t) => {
  await t.test("valid size S for Gymshark T-Shirt is accepted", () => {
    const result = validateOrderItem({ productId: 2, unitPrice: 2000, quantity: 1, size: "S" });
    assert.equal(result.valid, true);
  });

  await t.test("invalid size XXXL for Gymshark T-Shirt is rejected", () => {
    const result = validateOrderItem({ productId: 2, unitPrice: 2000, quantity: 1, size: "XXXL" });
    assert.equal(result.valid, false);
    assert.equal(result.code, "INVALID_SIZE");
  });
});

test("validateOrderItem: color validation against catalog", async (t) => {
  await t.test("valid color 'Duck Brown' for Carhartt accepted", () => {
    const result = validateOrderItem({ productId: 5, unitPrice: 4500, quantity: 1, size: "W32-34", color: "Duck Brown" });
    assert.equal(result.valid, true);
  });

  await t.test("invalid color 'Neon Pink' for Carhartt rejected", () => {
    const result = validateOrderItem({ productId: 5, unitPrice: 4500, quantity: 1, size: "W32-34", color: "Neon Pink" });
    assert.equal(result.valid, false);
    assert.equal(result.code, "INVALID_COLOR");
  });
});

// ─── 4. Product Catalog Integrity ────────────────────────────────────────────

test("Product Catalog: all 6 products have valid entries", async (t) => {
  for (const id of [1, 2, 3, 4, 5, 6]) {
    await t.test(`Product ${id} has price > 0 and non-empty sizes`, () => {
      const p = OFFICIAL_PRODUCT_CATALOG[id];
      assert.ok(p, `Product ${id} must exist`);
      assert.ok(p.price > 0, `Product ${id} price must be > 0`);
      assert.ok(p.validSizes.length > 0, `Product ${id} must have sizes`);
    });
  }
});

// ─── 5. Order Status Machine ──────────────────────────────────────────────────

test("Order Status State Machine", async (t) => {
  await t.test("all 5 valid statuses exist", () => {
    for (const s of ["new", "confirmed", "shipped", "delivered", "cancelled"]) {
      assert.ok(VALID_ORDER_STATUSES.includes(s), `Status '${s}' must be valid`);
    }
  });

  await t.test("arbitrary strings are rejected", () => {
    assert.equal(VALID_ORDER_STATUSES.includes("hacked"), false);
    assert.equal(VALID_ORDER_STATUSES.includes(""), false);
    assert.equal(VALID_ORDER_STATUSES.includes("pending"), false);
  });
});
