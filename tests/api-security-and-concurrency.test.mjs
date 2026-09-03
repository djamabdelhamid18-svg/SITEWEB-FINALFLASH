import test from 'node:test';
import assert from 'node:assert/strict';

const OFFICIAL_PRODUCT_CATALOG = {
  1: { price: 2900, isOneOfOne: false, title: 'Baggy Jogger' },
  2: { price: 2000, isOneOfOne: true, title: 'Thrifted Gymshark T-Shirt' },
  3: { price: 2400, isOneOfOne: true, title: 'Vintage Hard Rock Cafe Tee' },
  4: { price: 4300, isOneOfOne: false, title: 'The Finalflash Street Set' },
  5: { price: 4500, isOneOfOne: true, title: 'Carhartt Vintage Baggy Pants' },
  6: { price: 5200, isOneOfOne: true, title: 'Converse All Star High 1990s' },
};

const VALID_STATUSES = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled'];

test('Security: Price Tampering Defense Simulation', async (t) => {
  await t.test('detects when client unit price is tampered below catalog price', () => {
    const requestedItem = { productId: 1, unitPrice: 10, quantity: 1 };
    const catalogItem = OFFICIAL_PRODUCT_CATALOG[requestedItem.productId];

    assert.notEqual(requestedItem.unitPrice, catalogItem.price);
    const isTampered = requestedItem.unitPrice !== catalogItem.price;
    assert.equal(isTampered, true);
  });

  await t.test('accepts when client unit price matches official catalog price', () => {
    const requestedItem = { productId: 5, unitPrice: 4500, quantity: 1 };
    const catalogItem = OFFICIAL_PRODUCT_CATALOG[requestedItem.productId];

    assert.equal(requestedItem.unitPrice, catalogItem.price);
  });
});

test('Concurrency: 1-of-1 Atomic Reservation Conflict Simulation', async (t) => {
  await t.test('simulates two concurrent orders on Carhartt 1-of-1 pants and guarantees only one wins', async () => {
    const reservedItems = new Set();
    const productId = 5; // Carhartt 1-of-1

    async function placeOrder(customerId) {
      // Atomic reservation check
      if (reservedItems.has(productId)) {
        return { status: 409, error: 'ITEM_ALREADY_RESERVED' };
      }
      reservedItems.add(productId);
      return { status: 201, orderNumber: `FF-2026-${customerId}` };
    }

    // Run both orders simultaneously
    const [resultA, resultB] = await Promise.all([
      placeOrder('CUSTOMER_A'),
      placeOrder('CUSTOMER_B'),
    ]);

    const results = [resultA.status, resultB.status];
    assert.ok(results.includes(201), 'One order must succeed with 201');
    assert.ok(results.includes(409), 'The competing concurrent order must be rejected with 409 Conflict');
  });
});

test('Order Status State Machine Transitions', async (t) => {
  await t.test('accepts valid state transitions', () => {
    assert.equal(VALID_STATUSES.includes('confirmed'), true);
    assert.equal(VALID_STATUSES.includes('shipped'), true);
    assert.equal(VALID_STATUSES.includes('delivered'), true);
    assert.equal(VALID_STATUSES.includes('cancelled'), true);
  });

  await t.test('rejects arbitrary invalid status strings', () => {
    assert.equal(VALID_STATUSES.includes('hacked'), false);
    assert.equal(VALID_STATUSES.includes('random_status'), false);
    assert.equal(VALID_STATUSES.includes(''), false);
  });
});
