#!/usr/bin/env node
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as dotenv from "dotenv";
import * as path from "path";

// 加载环境变量 - 确保从正确的路径加载
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function main() {
    console.log("Migration started...");
    
    try {
        // 修改默认连接字符串为无密码版本
        const connectionString = process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/postgres';
        console.log("Using connection string:", connectionString.replace(/:[^:]*@/, ':****@')); // 隐藏密码
        
        const pool = new Pool({ connectionString });
        
        const db = drizzle(pool);
        
        await migrate(db, { migrationsFolder: "./drizzle" });
        
        console.log("Migration completed successfully");
        await pool.end();
    } catch (error) {
        console.error("Error during migration:", error);
        process.exit(1);
    }
}

main();