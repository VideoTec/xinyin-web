export const drop_all_tables = `
    DROP TABLE IF EXISTS wallets;
    DROP TABLE IF EXISTS migrations;
  `;
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
export const create_migration_table = `
        CREATE TABLE IF NOT EXISTS migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            version INTEGER NOT NULL UNIQUE,
            name TEXT NOT NULL,
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `;
export const get_current_db_version = `
    SELECT MAX(version) as version FROM migrations;
  `;
export const upsert_wallet = `
    INSERT INTO wallets (address, name, balance, cluster, has_key, is_mine, is_transfer_target)
    VALUES ($address, $name, $balance, $cluster, $hasKey, $isMine, $isTransferTarget)
    ON CONFLICT(address) DO UPDATE SET
      name = excluded.name,
      balance = excluded.balance,
      cluster = excluded.cluster,
      has_key = excluded.has_key,
      is_mine = excluded.is_mine,
      is_transfer_target = excluded.is_transfer_target,
      update_time = CURRENT_TIMESTAMP
  `;
export const select_wallets_of_cluster = `
    SELECT address as "$address", name as "$name", balance as "$balance", 
    cluster as "$cluster", has_key as "$hasKey", is_mine as "$isMine", is_transfer_target as "$isTransferTarget"
    FROM wallets WHERE cluster = ? ORDER BY create_time DESC
  `;
export const delete_wallet_by_address = `
    DELETE FROM wallets WHERE address = ?
  `;
