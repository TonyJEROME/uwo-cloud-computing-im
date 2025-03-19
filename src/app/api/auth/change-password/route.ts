import { UserService } from "@/services/user.service";
import { SessionService } from "@/services/session.service";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { currentPassword, newPassword } = await request.json();
        
        // 获取会话令牌
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get("session")?.value;
        
        if (!sessionToken) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        
        // 验证会话并获取用户 ID
        const session = await SessionService.validateSession(sessionToken);
        if (!session) {
            return NextResponse.json(
                { error: "Invalid or expired session" },
                { status: 401 }
            );
        }
        
        console.log("从会话中获取的用户 ID:", session.user.userId);
        
        // 验证当前密码
        await UserService.verifyPassword(session.user.userId, currentPassword);
        
        // 更新密码
        await UserService.updatePassword(session.user.userId, newPassword);
        
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error changing password:", error);
        return NextResponse.json(
            { error: error.message || "Failed to change password" },
            { status: 500 }
        );
    }
} 