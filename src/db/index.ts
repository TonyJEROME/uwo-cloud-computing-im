import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { pool } from "./pool"; // 导入共享的连接池

// 添加详细日志
console.log("初始化 Drizzle ORM");

// 创建 Drizzle 实例并添加明确的类型
let db: NodePgDatabase<typeof schema>;
try {
  db = drizzle(pool, { schema });
  console.log("Drizzle ORM 初始化成功");
} catch (error) {
  console.error("Drizzle ORM 初始化失败:", error);
  throw error;
}

console.log("导出数据库连接实例，内存地址:", db);

export { db };