import { LikeService } from "@/services/like.service";
import { SessionService } from "@/services/session.service";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        // Extract postId from URL path
        const pathname = new URL(request.url).pathname;
        const pathParts = pathname.split('/');
        const postId = pathParts[pathParts.length - 2]; // "-2" because the path ends with "/like"
        
        // Get session token
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get("session")?.value;
        
        if (!sessionToken) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        
        // Validate session and get user ID
        const session = await SessionService.validateSession(sessionToken);
        if (!session) {
            return NextResponse.json(
                { error: "Invalid or expired session" },
                { status: 401 }
            );
        }
        
        const userId = session.user.userId;
        
        // Toggle like
        const result = await LikeService.toggleLike(userId, postId);
        
        return NextResponse.json(result);
    } catch (error) {
        console.error("Error toggling like:", error);
        return NextResponse.json(
            { error: "Failed to toggle like" },
            { status: 500 }
        );
    }
}

// API to check if user has liked a post
export async function GET(request: NextRequest) {
    try {
        // Extract postId from URL path
        const pathname = new URL(request.url).pathname;
        const pathParts = pathname.split('/');
        const postId = pathParts[pathParts.length - 2];
        
        // Get session token
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get("session")?.value;
        
        if (!sessionToken) {
            return NextResponse.json(
                { liked: false, authenticated: false }
            );
        }
        
        // Validate session and get user ID
        const session = await SessionService.validateSession(sessionToken);
        if (!session) {
            return NextResponse.json(
                { liked: false, authenticated: false }
            );
        }
        
        const userId = session.user.userId;
        
        // Get like status
        const result = await LikeService.getLikeStatus(userId, postId);
        
        return NextResponse.json({
            ...result,
            authenticated: true
        });
    } catch (error) {
        console.error("Error checking like status:", error);
        return NextResponse.json(
            { error: "Failed to check like status" },
            { status: 500 }
        );
    }
} 