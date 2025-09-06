import sqlite3InitModule, {
  type OpfsSAHPoolDb,
  type OpfsSAHPoolUtil,
  type SQLite3API,
  type Stmt,
} from './sqlite3-bundler-friendly';
import * as Comlink from 'comlink';

let sqlite3: SQLite3API;
let poolUtil: OpfsSAHPoolUtil;
let opfsSAHPoolDb: OpfsSAHPoolDb;

let stmtUpsert: Stmt;
let stmtWalletsOfCluster: Stmt;

async function init() {
  sqlite3 = await sqlite3InitModule();
  poolUtil = await sqlite3.installOpfsSAHPoolVfs();
  opfsSAHPoolDb = new poolUtil.OpfsSAHPoolDb('local-db.db');
  stmtUpsert = opfsSAHPoolDb.prepare(
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
  stmtWalletsOfCluster = opfsSAHPoolDb.prepare(
    'SELECT * FROM wallets WHERE cluster = ? ORDER BY create_time DESC'
  );
}

async function openDB() {
  if (sqlite3) return;
  await init();
  // await new Promise((resolve) => {
  //   setTimeout(resolve, 3000);
  // });
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
}

function upsertWalletAddress(
  address: string,
  balance: number,
  cluster: string,
  hasKey: boolean = false,
  isMine: boolean = false
) {
  stmtUpsert.bind([address, balance, cluster, hasKey ? 1 : 0, isMine ? 1 : 0]);
  stmtUpsert.step();
  stmtUpsert.reset();
}

function getWalletsOfCluster(cluster: string) {
  // const wallets = [];
  stmtWalletsOfCluster.bind([cluster]);
  while (stmtWalletsOfCluster.step()) {
    // let stmt = stmtWalletsOfCluster.bind(cluster);
    // wallets.push(stmtWalletsOfCluster.get([]));
    console.log('Wallet:', stmtWalletsOfCluster.get([]));
    // stmtWalletsOfCluster.reset();
  }
  stmtWalletsOfCluster.reset();
}

const exportedApi = {
  openDB: openDB,
  upsertWalletAddress: upsertWalletAddress,
  getWalletsOfCluster: getWalletsOfCluster,
};

Comlink.expose(exportedApi);
