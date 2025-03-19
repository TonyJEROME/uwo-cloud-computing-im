import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hash, compare } from "bcrypt";

export class LoginService {
    static async login(email: string, password: string) {
        try {
            // 查找用户
            const user = await db.query.users.findFirst({
                where: eq(users.email, email),
            });
            
            if (!user) {
                throw new Error("User not found");
            }
            
            // 验证密码
            const isPasswordValid = await compare(password, user.passwordHash);
            if (!isPasswordValid) {
                throw new Error("Invalid password");
            }
            
            // 返回用户信息（不包含密码）
            const { passwordHash, ...userWithoutPassword } = user;
            return userWithoutPassword;
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    }
}
