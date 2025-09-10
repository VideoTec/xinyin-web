export const create_table_wallets = `
        CREATE TABLE IF NOT EXISTS wallets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            address TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            update_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            balance REAL,
            cluster TEXT,
            has_key INTEGER DEFAULT 0,
            is_mine INTEGER DEFAULT 0
        );
    `;
export const alert_table_wallets_add_column = `
        ALTER TABLE wallets ADD COLUMN name TEXT DEFAULT '';
    `;
export const upsert_wallet = `
    INSERT INTO wallets (address, name, balance, cluster, has_key, is_mine)
    VALUES ($address, $name, $balance, $cluster, $hasKey, $isMine)
    ON CONFLICT(address) DO UPDATE SET
      name = excluded.name,
      balance = excluded.balance,
      cluster = excluded.cluster,
      has_key = excluded.has_key,
      is_mine = excluded.is_mine,
      update_time = CURRENT_TIMESTAMP
  `;
export const select_wallets_of_cluster = `
    SELECT address as "$address", name as "$name", balance as "$balance", cluster as "$cluster", has_key as "$hasKey", is_mine as "$isMine"
    FROM wallets WHERE cluster = ? ORDER BY create_time DESC
  `;
export const delete_wallet_by_address = `
    DELETE FROM wallets WHERE address = ?
  `;
