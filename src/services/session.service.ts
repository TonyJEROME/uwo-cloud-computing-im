import { db } from "@/db";
import { sessions } from "@/db/schema";
import { eq } from "drizzle-orm";

// 使用内置方法生成唯一ID
function generateUniqueId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, 
              v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export class SessionService {
    static async createSession(userId: number) {
        // 生成唯一会话令牌
        const token = generateUniqueId();
        
        // 设置过期时间（7天后）
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        
        // 创建会话记录
        const [session] = await db.insert(sessions).values({
            userId,
            token,
            expiresAt,
        }).returning();
        
        return session;
    }
    
    static async validateSession(token: string) {
        console.log("验证会话令牌:", token);
        
        const session = await db.query.sessions.findFirst({
            where: eq(sessions.token, token),
            with: {
                user: true,
            },
        });
        
        console.log("会话验证结果:", session ? `找到会话，用户ID: ${session.user.userId}` : "未找到会话");
        
        if (!session) {
            return null;
        }
        
        // 检查会话是否过期
        if (new Date() > session.expiresAt) {
            // 删除过期会话
            await db.delete(sessions).where(eq(sessions.sessionId, session.sessionId));
            return null;
        }
        
        return session;
    }
    
    static async deleteSession(token: string) {
        await db.delete(sessions).where(eq(sessions.token, token));
    }
} 