import sqlite3InitModule, {
  type OpfsSAHPoolDb,
  type OpfsSAHPoolUtil,
  type SQLite3API,
  type Stmt,
} from './sqlite3-bundler-friendly';
import {
  create_table_wallets,
  create_migration_table,
  select_wallets_of_cluster,
  upsert_wallet,
  delete_wallet_by_address,
  drop_all_tables,
} from './sqlite3-stmt';
import * as Comlink from 'comlink';
import type { Wallet } from '../types/wallet';
import { sleep } from '../utils';
import { runMigrations } from './migration';

let sqlite3: SQLite3API;
let poolUtil: OpfsSAHPoolUtil;
let opfsSAHPoolDb: OpfsSAHPoolDb;

let stmtUpsert: Stmt;
let stmtWalletsOfCluster: Stmt;

async function openDB() {
  if (sqlite3) return;

  sqlite3 = await sqlite3InitModule();
  poolUtil = await sqlite3.installOpfsSAHPoolVfs();
  opfsSAHPoolDb = new poolUtil.OpfsSAHPoolDb('local-db.db');
  // opfsSAHPoolDb.exec(drop_all_tables);
  // await sleep(2 * 1000);
  opfsSAHPoolDb.exec(create_table_wallets);
  opfsSAHPoolDb.exec(create_migration_table);
  runMigrations(opfsSAHPoolDb);
  stmtUpsert = opfsSAHPoolDb.prepare(upsert_wallet);
  stmtWalletsOfCluster = opfsSAHPoolDb.prepare(select_wallets_of_cluster);
}

function upsertWalletAddress(wallet: Wallet) {
  // console.log('Upserting wallet:', wallet);
  stmtUpsert.bind(wallet);
  stmtUpsert.step();
  stmtUpsert.reset();
}

async function getWalletsOfCluster(cluster: string) {
  const wallets: Wallet[] = [];
  stmtWalletsOfCluster.bind([cluster]);

  while (stmtWalletsOfCluster.step()) {
    const wallet = stmtWalletsOfCluster.get({}) as Wallet;
    wallet.$hasKey = !!wallet.$hasKey;
    wallet.$isMine = !!wallet.$isMine;
    wallet.$isTransferTarget = !!wallet.$isTransferTarget;
    wallets.push(wallet);
  }

  stmtWalletsOfCluster.reset();
  // console.log(`Loaded ${wallets.length} wallets for cluster ${cluster}`);
  // await sleep(2 * 1000);
  return wallets;
}

function deleteWalletByAddress(address: string) {
  const stmt = opfsSAHPoolDb.prepare(delete_wallet_by_address);
  stmt.bind([address]);
  stmt.step();
  stmt.reset();
}

const exportedApi = {
  openDB,
  upsertWalletAddress,
  getWalletsOfCluster,
  deleteWalletByAddress,
};

export type SQLite3WorkerApi = typeof exportedApi;

Comlink.expose(exportedApi);
