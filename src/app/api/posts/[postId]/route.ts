import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { SessionService } from "@/services/session.service";

interface RequestContext {
  params: {
    postId: string;
  };
}

// 获取帖子
export async function GET(request: NextRequest) {
    try {
        // 从 URL 路径提取 postId
        const pathname = new URL(request.url).pathname;
        const pathSegments = pathname.split('/');
        const postId = pathSegments[pathSegments.length - 1];
        
        const post = await db.query.posts.findFirst({
            where: eq(posts.postId, postId),
            with: {
                user: true,
            },
        });

        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        return NextResponse.json(post);
    } catch (error) {
        console.error("Error getting post:", error);
        return NextResponse.json(
            { error: "Failed to get post" },
            { status: 500 }
        );
    }
}

// 删除帖子
export async function DELETE(request: NextRequest) {
    try {
        // 从 URL 路径提取 postId
        const pathname = new URL(request.url).pathname;
        const pathSegments = pathname.split('/');
        const postId = pathSegments[pathSegments.length - 1];
        
        console.log("尝试删除帖子, ID:", postId);
        
        // 获取会话令牌
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get("session")?.value;
        
        if (!sessionToken) {
            console.log("未授权: 没有会话令牌");
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        
        // 验证会话并获取用户 ID
        const session = await SessionService.validateSession(sessionToken);
        if (!session) {
            console.log("未授权: 无效或过期的会话");
            return NextResponse.json(
                { error: "Invalid or expired session" },
                { status: 401 }
            );
        }
        
        const userId = session.user.userId;
        console.log("当前用户 ID:", userId);
        
        // 查找帖子
        const post = await db.query.posts.findFirst({
            where: eq(posts.postId, postId),
        });
        
        if (!post) {
            console.log("帖子未找到");
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }
        
        console.log("帖子所有者 ID:", post.userId);
        
        // 检查权限 - 确保只有帖子作者才能删除帖子
        if (post.userId !== userId) {
            console.log("禁止: 用户不是帖子的所有者");
            return NextResponse.json(
                { error: "You don't have permission to delete this post" },
                { status: 403 }
            );
        }
        
        // 删除帖子
        await db.delete(posts).where(eq(posts.postId, postId));
        
        console.log("帖子删除成功");
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("删除帖子时出错:", error);
        return NextResponse.json(
            { error: "Failed to delete post" },
            { status: 500 }
        );
    }
} 