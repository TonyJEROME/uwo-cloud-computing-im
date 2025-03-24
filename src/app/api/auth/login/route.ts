import { LoginService } from "@/services/login.service";
import { SessionService } from "@/services/session.service";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();
        
        // 验证输入
        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }
        
        // 登录
        const user = await LoginService.login(email, password);
        
        // 创建会话
        const session = await SessionService.createSession(user.userId);
        
        // 设置会话 cookie
        const cookieStore = await cookies();
        cookieStore.set("session", session.token, {
            httpOnly: true,
            secure: false,
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });
        
        return NextResponse.json({ success: true, user });
    } catch (error: any) {
        console.error("Login route error:", error);
        return NextResponse.json(
            { error: error.message || "Login failed" },
            { status: 401 }
        );
    }
} 