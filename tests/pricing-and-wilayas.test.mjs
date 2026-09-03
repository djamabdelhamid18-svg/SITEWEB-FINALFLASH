import test from 'node:test';
import assert from 'node:assert/strict';

// Test Algerian Phone Number Normalization
function normalizeAlgerianPhone(input) {
  let cleaned = input.replace(/[\s\-\(\)\.]/g, '');
  if (cleaned.startsWith('+213')) {
    cleaned = '0' + cleaned.slice(4);
  } else if (cleaned.startsWith('00213')) {
    cleaned = '0' + cleaned.slice(5);
  } else if (cleaned.startsWith('213')) {
    cleaned = '0' + cleaned.slice(3);
  }
  const valid = /^0[567]\d{8}$/.test(cleaned);
  return { valid, normalized: cleaned };
}

// Test Authoritative Algerian Delivery Calculation Matrix
function calculateAuthoritativeDeliveryFee(wilaya, method) {
  if (!wilaya) return method === 'home' ? 600 : 400;

  const alger = ['16 - Alger', '16 - الجزائر العاصمة', '16'];
  const centerNorth = [
    '09 - Blida', '09 - البليدة', '09',
    '35 - Boumerdès', '35 - بومرداس', '35',
    '42 - Tipaza', '42 - تيبازة', '42',
    '10 - Bouira', '10 - البويرة', '10',
    '15 - Tizi Ouzou', '15 - تيزي وزو', '15',
    '26 - Médéa', '26 - المدية', '26',
    '31 - Oran', '31 - وهران', '31',
    '25 - Constantine', '25 - قسنطينة', '25',
    '23 - Annaba', '23 - عنابة', '23',
    '06 - Béjaïa', '06 - بجاية', '06',
    '18 - Jijel', '18 - جيجل', '18',
    '13 - Tlemcen', '13 - تلمسان', '13',
    '27 - Mostaganem', '27 - مستغانم', '27'
  ];
  const southBig = [
    '01 - Adrar', '01 - أدرار', '01',
    '08 - Béchar', '08 - بشار', '08',
    '11 - Tamanrasset', '11 - تمنراست', '11',
    '30 - Ouargla', '30 - ورقلة', '30',
    '33 - Illizi', '33 - إليزي', '33',
    '37 - Tindouf', '37 - تندوف', '37',
    '47 - Ghardaïa', '47 - غرداية', '47',
    '49 - Timimoun', '49 - تيميمون', '49',
    '50 - Bordj Badji Mokhtar', '50 - برج باجي مختار', '50',
    '52 - Béni Abbès', '52 - بني عباس', '52',
    '53 - In Salah', '53 - عين صالح', '53',
    '54 - In Guezzam', '54 - عين قزام', '54',
    '56 - Djanet', '56 - جانت', '56',
    '58 - El Meniaa', '58 - المنيعة', '58'
  ];

  if (alger.some((w) => wilaya.includes(w))) {
    return method === 'home' ? 400 : 250;
  }
  if (centerNorth.some((w) => wilaya.includes(w))) {
    return method === 'home' ? 600 : 400;
  }
  if (southBig.some((w) => wilaya.includes(w))) {
    return method === 'home' ? 950 : 650;
  }
  return method === 'home' ? 700 : 450;
}

test('Phone Number Validation & Normalization', async (t) => {
  await t.test('accepts valid Mobilis 06 number', () => {
    const res = normalizeAlgerianPhone('0632124401');
    assert.equal(res.valid, true);
    assert.equal(res.normalized, '0632124401');
  });

  await t.test('normalizes +213 international format', () => {
    const res = normalizeAlgerianPhone('+213 778 65 96 40');
    assert.equal(res.valid, true);
    assert.equal(res.normalized, '0778659640');
  });

  await t.test('rejects foreign or malformed phone numbers', () => {
    assert.equal(normalizeAlgerianPhone('0123456789').valid, false);
    assert.equal(normalizeAlgerianPhone('123456').valid, false);
    assert.equal(normalizeAlgerianPhone('+33612345678').valid, false);
  });
});

test('Delivery Fee Matrix for 58 Algerian Wilayas', async (t) => {
  await t.test('Algiers (Wilaya 16) home delivery is 400 DA and desk is 250 DA', () => {
    assert.equal(calculateAuthoritativeDeliveryFee('16 - Alger', 'home'), 400);
    assert.equal(calculateAuthoritativeDeliveryFee('16 - الجزائر العاصمة', 'desk'), 250);
  });

  await t.test('Center/North wilayas (e.g. Oran 31, Blida 09) home delivery is 600 DA and desk is 400 DA', () => {
    assert.equal(calculateAuthoritativeDeliveryFee('31 - Oran', 'home'), 600);
    assert.equal(calculateAuthoritativeDeliveryFee('09 - البليدة', 'desk'), 400);
  });

  await t.test('South wilayas (e.g. Tamanrasset 11, Adrar 01) home delivery is 950 DA and desk is 650 DA', () => {
    assert.equal(calculateAuthoritativeDeliveryFee('11 - Tamanrasset', 'home'), 950);
    assert.equal(calculateAuthoritativeDeliveryFee('01 - أدرار', 'desk'), 650);
  });
});
