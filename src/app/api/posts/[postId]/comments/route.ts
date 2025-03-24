import { CommentService } from "@/services/comment.service";
import { SessionService } from "@/services/session.service";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { comments } from "@/db/schema";

// POST - Create a new comment
export async function POST(
    request: NextRequest,
    { params }: { params: { postId: string } }
) {
    try {
        const { content } = await request.json() as { content: string };
        const postId = params.postId;
        
        // Validate postId
        if (!postId) {
            return NextResponse.json(
                { error: "Post ID is required" },
                { status: 400 }
            );
        }
        
        // Check authentication
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
        
        // Create comment
        const newComment = await CommentService.createComment(userId, postId, content);
        
        // Get user info to return along with the comment
        const commentWithUser = await db.query.comments.findFirst({
            where: eq(comments.commentId, newComment.commentId),
            with: {
                user: true,
            },
        });
        
        return NextResponse.json(commentWithUser);
    } catch (error: any) {
        console.error("Error creating comment:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create comment" },
            { status: 500 }
        );
    }
}

// GET - Fetch comments for a post
export async function GET(
    request: NextRequest,
    { params }: { params: { postId: string } }
) {
    try {
        const postId = params.postId;
        
        // Validate postId
        if (!postId) {
            return NextResponse.json(
                { error: "Post ID is required" },
                { status: 400 }
            );
        }
        
        const comments = await CommentService.getCommentsForPost(postId);
        
        return NextResponse.json(comments);
    } catch (error: any) {
        console.error("Error fetching comments:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch comments" },
            { status: 500 }
        );
    }
} 