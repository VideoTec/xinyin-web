import sqlite3InitModule from './sqlite3-bundler-friendly';

const sqlite3 = await sqlite3InitModule();
const poolUtil = await sqlite3.installOpfsSAHPoolVfs();

let opfsSAHPoolDb = new poolUtil.OpfsSAHPoolDb('local-db.db');
opfsSAHPoolDb.exec(
  `
        CREATE TABLE IF NOT EXISTS wallets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            address TEXT NOT NULL UNIQUE,
            create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            update_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            balance REAL,
            cluster TEXT,
            has_key INTEGER DEFAULT 0,
            is_mine INTEGER DEFAULT 0
        );
    `
);

const stmtUpsert = opfsSAHPoolDb.prepare(
  `
    INSERT INTO wallets (address, balance, cluster, has_key, is_mine)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(address) DO UPDATE SET
      balance = excluded.balance,
      cluster = excluded.cluster,
      has_key = excluded.has_key,
      is_mine = excluded.is_mine,
      update_time = CURRENT_TIMESTAMP
  `
);

export function upsertWalletAddress(
  address: string,
  balance: number,
  cluster: string,
  hasKey: boolean = false,
  isMine: boolean = false
) {
  stmtUpsert.bind([address, balance, cluster, hasKey ? 1 : 0, isMine ? 1 : 0]);
  stmtUpsert.step();
  //   stmtUpsert.reset();
}

upsertWalletAddress('example_wallet', 500.0, 'mainnet-beta');
upsertWalletAddress('example_wallet2', 2500.0, 'mainnet-beta', true, false);

const stmt = opfsSAHPoolDb.prepare('SELECT * FROM wallets;');
while (stmt.step()) {
  const row = stmt.get([]);
  console.log('Row:', row);
}
stmt.finalize();
