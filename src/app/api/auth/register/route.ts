import { UserService } from "@/services/user.service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { email, password, firstName, lastName } = await request.json();
        
        console.log("收到注册请求:", { email, firstName, lastName });
        
        // 创建用户
        const user = await UserService.registerUser(
            email, 
            password, 
            firstName, 
            lastName
        );
        
        console.log("用户创建响应:", user ? "成功" : "失败");
        
        return NextResponse.json({ success: true, user });
    } catch (error: any) {
        console.error("注册异常:", error);
        return NextResponse.json(
            { error: "Registration failed", message: error.message },
            { status: 500 }
        );
    }
} 