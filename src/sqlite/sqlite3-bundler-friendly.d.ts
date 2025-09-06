export interface SQLite3Config {
  print?: (text: string) => void;
  printErr?: (text: string) => void;
}

export interface SQLite3Version {
  downloadVersion: string;
  libVersion: string;
  libVersionNumber: string;
  sourceId: string;
}

export declare class Stmt {
  /**
   * 绑定参数到预编译语句
   * @example
   * stmt.bind([1, 'hello']);           // 绑定数组
   * stmt.bind({name: 'John', age: 30}); // 绑定对象
   * stmt.bind('value');                // 绑定到索引1
   * stmt.bind(2, 'value');             // 绑定到索引2
   */
  bind(): Stmt;
  bind(values: any[]): Stmt;
  bind(values: Record<string | number, any>): Stmt;
  bind(value: any): Stmt;
  bind(index: number, value: any): Stmt;

  get(): any; // 获取第0列
  get(columnIndex: number): any; // 获取指定列
  get(columnIndex: number, asType: number): any; // 指定类型获取
  get(target: any[]): any[]; // 填充数组
  get(target: Record<string, any>): Record<string, any>; // 填充对象

  readonly parameterCount: number;
  /**
   * 执行语句，返回是否有更多行
   * @returns true 如果有结果行可读取，false 表示执行完成或无结果
   */
  step(): boolean;
  /**
   * 释放语句占用的所有资源
   * 调用后该语句对象不能再使用
   * @important 必须调用以避免内存泄漏
   */
  finalize(): void;
  /**
   * 重置语句状态，准备重新执行
   */
  reset(): Stmt;
}

export declare class DB {
  constructor(filename?: string, ...args: any[]);

  filename: string;
  pointer: number;

  exec(sql: string): DB;
  prepare(sql: string): Stmt;
  close(): void;
  selectValue(sql: string, bind?: any[]): any;
  selectValues(sql: string, bind?: any[]): any[];
  selectObjects(sql: string, bind?: any[]): Record<string, any>[];

  static readonly version: string;

  static open(filename: string): DB;
  /** 当前打开的 Stmt 句柄数量 */
  openStatementCount(): number;
}

export interface SQLite3OO1 {
  DB: typeof DB;
  Stmt: typeof Stmt;
}

interface OpfsSAHPoolInstallConfig {
  /**
   * - 默认 false
   * - 为真时，
   *    - 在初始化期间，
   *    - 每当获取到 SAH（同步句柄）时会清除内容和文件名映射，
   *    - 把 VFS 存储区重置为初始状态。
   * - 仅适用于不需要持久化数据的场景 */
  clearOnInit: boolean;
  /**
   * - 默认 6
   * - VFS 可以容纳的文件数量（即池的大小） */
  initialCapacity: number;
  /**
   * - 默认是 `.+options.name`，比如 `.opfs-sahpool/`。
   * - 指定在 OPFS 中存储元数据的目录名。
   */
  directory: string;
  /**
   * - 默认 “opfs-sahpool”
   * - 注册 VFS 时用的名字
   */
  name: string;
  forceReinitIfPreviouslyFailed: boolean;
}

export declare class OpfsSAHPoolDb extends DB {
  constructor(filename?: string, ...args: any[]);
}

export declare class OpfsSAHPoolUtil {
  /**本池注册的 VFS 名字 */
  vfsName: string;
  /** 一个继承自 sqlite3.oo1.DB 的类的构造方法，专门配好使用本 VFS */
  OpfsSAHPoolDb: typeof OpfsSAHPoolDb;
  /** 当前池容量（文件数） */
  getCapacity(): number;
  /**
   * 池当前分配给 VFS 槽的文件名数组
   */
  getFileNames(): string[];
  /**
   * 注销 VFS 并删除其目录（所有内容都被销毁！）。
   * - 调用后本 VFS 不能再用，除非刷新页面。
   * - 多级目录只删最底层。
   * - Promise 成功返回 true，未安装则 false。
   */
  removeVfs(): Promise<boolean>;
}

export interface SQLite3API {
  version: SQLite3Version;
  oo1: SQLite3OO1;
  installOpfsSAHPoolVfs: (
    config?: OpfsSAHPoolInstallConfig
  ) => Promise<OpfsSAHPoolUtil>;
}

declare function sqlite3InitModule(config?: SQLite3Config): Promise<SQLite3API>;

export default sqlite3InitModule;
