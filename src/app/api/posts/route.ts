import { PostService } from "@/services/post.service";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { SessionService } from "@/services/session.service";

export async function POST(request: NextRequest) {
    try {
        const { content } = await request.json();
        
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
        
        // 确保 userId 是数字类型
        const userId = typeof session.user.userId === 'string' 
            ? parseInt(session.user.userId, 10) 
            : session.user.userId;
            
        console.log("从会话获取的用户ID类型:", typeof userId, "值:", userId);
        
        // 创建帖子
        const [post] = await PostService.createPost(userId, content);
        
        return NextResponse.json(post);
    } catch (error: any) {
        console.error("创建帖子错误:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create post" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const posts = await PostService.getAllPosts();
        return NextResponse.json(posts);
    } catch (error: any) {
        console.error("Error fetching posts:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch posts" },
            { status: 500 }
        );
    }
} 