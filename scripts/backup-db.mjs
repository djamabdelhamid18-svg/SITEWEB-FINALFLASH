import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('[Error] DATABASE_URL environment variable is required to run backup.');
  process.exit(1);
}

const client = new pg.Client({ connectionString });

async function backup() {
  const backupsDir = path.join(__dirname, '../backups');
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupsDir, `finalflash-backup-${timestamp}.json`);

  console.log(`[Backup] Connecting to database...`);
  await client.connect();

  const tables = ['orders', 'order_items', 'inventory_reservations', 'order_audit_logs', 'admin_users', 'products'];
  const dump = {
    version: '1.0',
    createdAt: new Date().toISOString(),
    database: client.database,
    data: {}
  };

  for (const table of tables) {
    try {
      const res = await client.query(`SELECT * FROM ${table}`);
      dump.data[table] = res.rows;
      console.log(`[Backup] Exported ${res.rows.length} rows from table: ${table}`);
    } catch (err) {
      console.warn(`[Backup] Skipping non-existent table: ${table}`);
    }
  }

  await client.end();
  fs.writeFileSync(backupFile, JSON.stringify(dump, null, 2), 'utf-8');
  console.log(`[Backup] Successfully saved database snapshot to:\n${backupFile}`);
}

backup().catch((err) => {
  console.error('[Backup Error]', err);
  process.exit(1);
});
