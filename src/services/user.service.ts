import { db } from "@/db";
import { users } from "@/db/schema";
import { hash, compare } from "bcrypt";
import { eq } from "drizzle-orm";
import { Pool } from "pg";
import * as dotenv from "dotenv";

// 创建连接池实例
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres@localhost:5432/postgres'
});

export class UserService {
    static async registerUser(
        email: string,
        password: string,
        firstName: string,
        lastName: string
    ) {
        try {
            const hashedPassword = await hash(password, 10);
            const userId = Math.floor(Math.random() * 1000000);
            
            console.log("Starting user registration:", {userId, email, firstName, lastName});
            
            // 尝试使用事务和直接 SQL 插入
            const client = await pool.connect();
            
            try {
                await client.query('BEGIN');
                
                // 直接执行 SQL 语句
                const insertSQL = `
                    INSERT INTO users (user_id, email, password_hash, first_name, last_name, is_active, is_verified, created_at, updated_at) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING *
                `;
                
                const result = await client.query(insertSQL, [
                    userId, email, hashedPassword, firstName, lastName, true, false
                ]);
                
                console.log("SQL direct insert result:", result.rows[0]);
                
                await client.query('COMMIT');
                return result.rows[0];
            } catch (err) {
                await client.query('ROLLBACK');
                console.error("SQL execution error:", err);
                throw err;
            } finally {
                client.release();
            }
        } catch (error) {
            console.error("User registration error:", error);
            throw error;
        }
    }

    static async verifyPassword(userId: number, password: string) {
        try {
            console.log("Verifying user password, userId:", userId);
            
            // 尝试查找用户
            const user = await db.query.users.findFirst({
                where: eq(users.userId, userId),
            });
            
            console.log("Query result:", user ? "User found" : "User not found");
            
            if (!user) {
                // 尝试使用直接 SQL 查询
                const client = await pool.connect();
                try {
                    const result = await client.query('SELECT * FROM users WHERE user_id = $1', [userId]);
                    console.log("SQL direct query result:", result.rows[0] ? "User found" : "User not found");
                    
                    if (result.rows.length === 0) {
                        throw new Error("User not found");
                    }
                    
                    // 使用查询到的用户进行密码验证
                    const isValid = await compare(password, result.rows[0].password_hash);
                    if (!isValid) {
                        throw new Error("Current password is incorrect");
                    }
                    
                    return true;
                } finally {
                    client.release();
                }
            }
            
            const isValid = await compare(password, user.passwordHash);
            if (!isValid) {
                throw new Error("Current password is incorrect");
            }
            
            return true;
        } catch (error) {
            console.error("Error verifying password:", error);
            throw error;
        }
    }

    static async updatePassword(userId: number, newPassword: string) {
        const passwordHash = await hash(newPassword, 10);
        
        await db.update(users)
            .set({ passwordHash, updatedAt: new Date() })
            .where(eq(users.userId, userId));
        
        return true;
    }
}
