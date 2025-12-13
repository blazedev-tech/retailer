import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'retailer.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS stock (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_id TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    hsn_sac TEXT,
    quantity INTEGER NOT NULL DEFAULT 0,
    rate_per_pcs REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_number TEXT UNIQUE NOT NULL,
    customer_name TEXT,
    customer_phone TEXT,
    total_amount REAL NOT NULL,
    discount REAL DEFAULT 0,
    final_amount REAL NOT NULL,
    qr_code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS bill_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id INTEGER NOT NULL,
    stock_id INTEGER NOT NULL,
    batch_id TEXT NOT NULL,
    description TEXT NOT NULL,
    hsn_sac TEXT,
    quantity INTEGER NOT NULL,
    rate_per_pcs REAL NOT NULL,
    discount REAL DEFAULT 0,
    amount REAL NOT NULL,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
    FOREIGN KEY (stock_id) REFERENCES stock(id)
  );

  CREATE TABLE IF NOT EXISTS ledger (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id INTEGER NOT NULL,
    transaction_type TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_bills_date ON bills(created_at);
  CREATE INDEX IF NOT EXISTS idx_ledger_date ON ledger(created_at);
  CREATE INDEX IF NOT EXISTS idx_stock_description ON stock(description);
  CREATE INDEX IF NOT EXISTS idx_stock_batch_id ON stock(batch_id);
`);

export default db;
