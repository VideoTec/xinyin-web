import { get_current_db_version } from './sqlite3-stmt';
import type { OpfsSAHPoolDb } from './sqlite3-bundler-friendly';

type Migration = {
  version: number;
  name: string;
  sql: string;
};

// 定义所有的迁移脚本
const migrations: Migration[] = [
  {
    version: 1,
    name: '为 wallets 表添加 is_transfer_target 列',
    sql: `
        BEGIN TRANSACTION;
        ALTER TABLE wallets ADD COLUMN is_transfer_target INTEGER DEFAULT 0;
        INSERT INTO migrations (version, name) VALUES (?, ?);
        COMMIT;
    `,
  },
];

export function runMigrations(opfsSAHPoolDb: OpfsSAHPoolDb) {
  const currentVersion = opfsSAHPoolDb.selectValue(get_current_db_version) || 0;
  console.log('当前数据库版本:', currentVersion);

  migrations.forEach((migration) => {
    if (migration.version > currentVersion) {
      try {
        opfsSAHPoolDb.exec(migration.sql, {
          bind: [migration.version, migration.name],
        });
        console.log(`迁移 '${migration.name}' 应用成功`);
      } catch (error) {
        opfsSAHPoolDb.exec('ROLLBACK;');
        console.error(`迁移 '${migration.name}' 失败:`, error);
        throw error; // 停止后续迁移
      }
    } else {
      console.log(
        `跳过迁移: '${migration.name}' (版本 '${migration.version}') 已应用`
      );
    }
  });
}
