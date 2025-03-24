import { ImageService } from "@/services/image.service";
import { SessionService } from "@/services/session.service";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
    try {
        // Extract postId from URL path
        const pathname = new URL(request.url).pathname;
        const pathParts = pathname.split('/');
        const postId = pathParts[pathParts.length - 2]; // path ends with '/image'
        
        console.log("Image upload requested for post:", postId);
        
        // Validate postId
        if (!postId || postId === 'undefined' || postId === '[postId]') {
            console.error('Invalid postId in URL path:', postId);
            return NextResponse.json(
                { error: "Invalid post ID" },
                { status: 400 }
            );
        }
        
        // Check authentication
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get("session")?.value;
        
        if (!sessionToken) {
            console.log("Unauthorized image upload attempt - no session token");
            return NextResponse.json(
                { error: "Unauthorized - no session token" },
                { status: 401 }
            );
        }
        
        // Validate session and get user ID
        const session = await SessionService.validateSession(sessionToken);
        if (!session) {
            console.log("Unauthorized image upload attempt - invalid session");
            return NextResponse.json(
                { error: "Invalid or expired session" },
                { status: 401 }
            );
        }
        
        console.log("User authenticated for image upload, user ID:", session.user.userId);
        
        // Process the form data
        const formData = await request.formData();
        const file = formData.get('image') as File;
        
        if (!file) {
            console.log("No image provided in upload request");
            return NextResponse.json(
                { error: "No image provided" },
                { status: 400 }
            );
        }
        
        console.log("Processing image upload:", file.name, "size:", file.size);
        
        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer());
        
        // Upload image
        console.log("Calling ImageService to upload image");
        const result = await ImageService.uploadImage(buffer, file.name, postId);
        console.log("Image upload successful, returning result:", result);
        
        return NextResponse.json(result);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error('Error uploading image:', error);
        return NextResponse.json(
            { error: `Failed to upload image: ${errorMessage}` },
            { status: 500 }
        );
    }
}

// GET endpoint to retrieve images for a post
export async function GET(request: NextRequest) {
    try {
        // Extract postId from URL path
        const pathname = new URL(request.url).pathname;
        const pathParts = pathname.split('/');
        const postId = pathParts[pathParts.length - 2];
        
        // Get images for the post
        const images = await ImageService.getImagesForPost(postId);
        
        return NextResponse.json(images);
    } catch (error) {
        console.error('Error getting images:', error);
        return NextResponse.json(
            { error: "Failed to get images" },
            { status: 500 }
        );
    }
} 