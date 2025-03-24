import { PostService } from "@/services/post.service";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { SessionService } from "@/services/session.service";
import { ImageService } from "@/services/image.service";

export async function POST(request: NextRequest) {
    try {
        const { content, imageIds, isTemporary } = await request.json();
        
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
        
        // Create the post
        const newPost = await PostService.createPost(userId, content, isTemporary);
        
        // If there are image IDs, associate them with the post
        if (imageIds && imageIds.length > 0) {
            await Promise.all(imageIds.map(imageId => 
                ImageService.associateImageWithPost(imageId, newPost.postId)
            ));
        }
        
        return NextResponse.json(newPost);
    } catch (error: any) {
        console.error("Error creating post:", error);
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