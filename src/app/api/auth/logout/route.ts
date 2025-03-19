import { SessionService } from "@/services/session.service";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get("session")?.value;
        
        if (sessionToken) {
            // 删除会话
            await SessionService.deleteSession(sessionToken);
        }
        
        // 清除 cookie
        cookieStore.delete("session");
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json(
            { error: "Failed to logout" },
            { status: 500 }
        );
    }
} 