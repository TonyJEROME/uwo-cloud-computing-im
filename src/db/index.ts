import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema"
import { Pool } from "pg";

// 问题1: 注释掉的import和重复的pg导入是多余的
// 问题2: DATABASE_URL应该作为connectionString使用，而不是host
// 问题3: 应该处理连接错误

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // SSL配置可能需要根据环境添加
    // ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});

// 监听连接错误
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

export const db = drizzle(pool, { schema });