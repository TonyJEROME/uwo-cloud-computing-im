import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

config({ path: ".env" });

// 问题1: DATABASE_URL 应该是完整的连接字符串，而不是 host
const sql = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    // 如果使用单独的配置，应该是这样:
    // host: process.env.DATABASE_HOST,
    // port: Number(process.env.DATABASE_PORT) || 5432,
    // user: process.env.DATABASE_USER,
    // password: process.env.DATABASE_PASSWORD,
    // database: process.env.DATABASE_NAME,
});

const db = drizzle(sql);

const main = async () => {
    try {
        // Add DROP TABLE IF EXISTS before creating new tables
        // or use drizzle-kit's built-in migration system
        await migrate(db, { migrationsFolder: "./drizzle" });
        console.log("Migration completed successfully");
    } catch (error) {
        console.error("Error during migration:", error);
        process.exit(1);
    } finally {
        // 问题2: 需要关闭数据库连接
        await sql.end();
    }
    process.exit(0);
};

main();