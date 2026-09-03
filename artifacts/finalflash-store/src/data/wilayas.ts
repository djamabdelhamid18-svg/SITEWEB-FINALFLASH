export const wilayas = [
  '01 - Adrar', '02 - Chlef', '03 - Laghouat', '04 - Oum El Bouaghi', '05 - Batna', '06 - Béjaïa',
  '07 - Biskra', '08 - Béchar', '09 - Blida', '10 - Bouira', '11 - Tamanrasset', '12 - Tébessa',
  '13 - Tlemcen', '14 - Tiaret', '15 - Tizi Ouzou', '16 - Alger', '17 - Djelfa', '18 - Jijel',
  '19 - Sétif', '20 - Saïda', '21 - Skikda', '22 - Sidi Bel Abbès', '23 - Annaba', '24 - Guelma',
  '25 - Constantine', '26 - Médéa', '27 - Mostaganem', '28 - M\'Sila', '29 - Mascara', '30 - Ouargla',
  '31 - Oran', '32 - El Bayadh', '33 - Illizi', '34 - Bordj Bou Arréridj', '35 - Boumerdès', '36 - El Tarf',
  '37 - Tindouf', '38 - Tissemsilt', '39 - El Oued', '40 - Khenchela', '41 - Souk Ahras', '42 - Tipaza',
  '43 - Mila', '44 - Aïn Defla', '45 - Naâma', '46 - Aïn Témouchent', '47 - Ghardaïa', '48 - Relizane',
  '49 - Timimoun', '50 - Bordj Badji Mokhtar', '51 - Ouled Djellal', '52 - Béni Abbès', '53 - In Salah',
  '54 - In Guezzam', '55 - Touggourt', '56 - Djanet', '57 - El M\'Ghair', '58 - El Meniaa'
];

/**
 * Calculates delivery fee based on Algerian territory zones.
 */
export function calculateDeliveryFee(wilaya: string, method: 'home' | 'desk'): number {
  if (!wilaya) return method === 'home' ? 600 : 400;

  const alger = ['16 - Alger'];
  const centerNorth = [
    '09 - Blida', '35 - Boumerdès', '42 - Tipaza', '10 - Bouira',
    '15 - Tizi Ouzou', '26 - Médéa', '31 - Oran', '25 - Constantine',
    '23 - Annaba', '06 - Béjaïa', '18 - Jijel', '13 - Tlemcen', '27 - Mostaganem'
  ];
  const southBig = [
    '01 - Adrar', '08 - Béchar', '11 - Tamanrasset', '30 - Ouargla',
    '33 - Illizi', '37 - Tindouf', '47 - Ghardaïa', '49 - Timimoun',
    '50 - Bordj Badji Mokhtar', '52 - Béni Abbès', '53 - In Salah',
    '54 - In Guezzam', '56 - Djanet', '58 - El Meniaa'
  ];

  if (alger.some(w => wilaya.includes(w))) {
    return method === 'home' ? 400 : 250;
  }
  if (centerNorth.some(w => wilaya.includes(w))) {
    return method === 'home' ? 600 : 400;
  }
  if (southBig.some(w => wilaya.includes(w))) {
    return method === 'home' ? 950 : 650;
  }
  return method === 'home' ? 700 : 450;
}

/**
 * Normalizes Algerian phone numbers (+213, 00213, 213, 05/06/07).
 */
export function normalizeAlgerianPhone(input: string): { valid: boolean; normalized: string } {
  const digits = input.replace(/\D/g, '');
  if (/^0[567]\d{8}$/.test(digits)) {
    return { valid: true, normalized: digits };
  }
  if (/^213[567]\d{8}$/.test(digits)) {
    return { valid: true, normalized: '0' + digits.slice(3) };
  }
  if (/^00213[567]\d{8}$/.test(digits)) {
    return { valid: true, normalized: '0' + digits.slice(5) };
  }
  return { valid: false, normalized: input.trim() };
}
