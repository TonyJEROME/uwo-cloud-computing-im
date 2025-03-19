import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

// 从连接字符串中解析各个参数
const parseConnectionString = (connectionString: string) => {
  try {
    const url = new URL(connectionString);
    return {
      host: url.hostname,
      port: parseInt(url.port || '5432'),
      user: url.username,
      password: url.password,
      database: url.pathname.substring(1), // 移除前导斜杠
    };
  } catch (error) {
    console.error('无法解析连接字符串', error);
    // 返回默认值
    return {
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: '',
      database: 'postgres',
    };
  }
};

const connectionString = process.env.DATABASE_URL || "postgresql://postgres@localhost:5432/postgres";
const dbParams = parseConnectionString(connectionString);

export default {
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        host: dbParams.host,
        port: dbParams.port,
        user: dbParams.user,
        password: dbParams.password,
        database: dbParams.database,
        // 如果需要 SSL
        // ssl: process.env.NODE_ENV === "production" ? true : false,
    },
} satisfies Config;
