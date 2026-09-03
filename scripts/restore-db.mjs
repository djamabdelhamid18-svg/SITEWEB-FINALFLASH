import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('[Error] DATABASE_URL environment variable is required to run restore.');
  process.exit(1);
}

const targetFile = process.argv[2];
if (!targetFile) {
  console.error('Usage: node scripts/restore-db.mjs <path-to-backup.json>');
  process.exit(1);
}

const resolvedPath = path.resolve(targetFile);
if (!fs.existsSync(resolvedPath)) {
  console.error(`[Error] Backup file not found at: ${resolvedPath}`);
  process.exit(1);
}

const client = new pg.Client({ connectionString });

async function restore() {
  const content = JSON.parse(fs.readFileSync(resolvedPath, 'utf-8'));
  console.log(`[Restore] Restoring backup created at: ${content.createdAt}`);

  await client.connect();

  const tables = ['orders', 'order_items', 'inventory_reservations', 'order_audit_logs', 'admin_users', 'products'];

  for (const table of tables) {
    const rows = content.data[table];
    if (!rows || rows.length === 0) continue;

    console.log(`[Restore] Restoring ${rows.length} records into table: ${table}...`);
    for (const row of rows) {
      const keys = Object.keys(row);
      const values = Object.values(row);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const columns = keys.map(k => `"${k}"`).join(', ');

      const query = `
        INSERT INTO "${table}" (${columns})
        VALUES (${placeholders})
        ON CONFLICT DO NOTHING
      `;
      try {
        await client.query(query, values);
      } catch (err) {
        console.warn(`[Restore Warning] Row failed in ${table}:`, err.message);
      }
    }
  }

  await client.end();
  console.log('[Restore] Completed successfully.');
}

restore().catch((err) => {
  console.error('[Restore Error]', err);
  process.exit(1);
});
