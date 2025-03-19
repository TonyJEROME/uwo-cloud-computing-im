import { Pool } from "pg";
import * as dotenv from "dotenv";
import * as path from "path";

// 加载环境变量
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// 创建并导出连接池
console.log("初始化数据库连接池");
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/postgres';
console.log("使用连接字符串:", connectionString.replace(/:[^:]*@/, ':****@'));

export const pool = new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
});

// 测试连接
(async () => {
    try {
        const client = await pool.connect();
        try {
            console.log("PostgreSQL 连接成功");
            
            // 检查表是否存在
            const tablesResult = await client.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            `);
            
            console.log("数据库中的表:", tablesResult.rows.map(row => row.table_name));
            
            // 如果 users 表存在，检查其中的数据
            if (tablesResult.rows.some(row => row.table_name === 'users')) {
                const usersResult = await client.query('SELECT COUNT(*) FROM users');
                console.log("users 表中的记录数:", usersResult.rows[0].count);
            }
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("PostgreSQL 连接失败:", error);
    }
})();

// 监听连接池事件
pool.on('error', (err) => {
    console.error('连接池意外错误:', err);
}); 