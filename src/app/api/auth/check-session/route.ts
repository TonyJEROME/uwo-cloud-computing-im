import { SessionService } from "@/services/session.service";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get("session")?.value;
        
        if (!sessionToken) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        
        // 验证会话
        const session = await SessionService.validateSession(sessionToken);
        if (!session) {
            return NextResponse.json(
                { error: "Invalid or expired session" },
                { status: 401 }
            );
        }
        
        return NextResponse.json({ 
            isLoggedIn: true,
            user: {
                userId: session.user.userId,
                email: session.user.email,
                firstName: session.user.firstName,
                lastName: session.user.lastName
            }
        });
    } catch (error) {
        console.error("Error checking session:", error);
        return NextResponse.json(
            { error: "Failed to check session" },
            { status: 500 }
        );
    }
} 