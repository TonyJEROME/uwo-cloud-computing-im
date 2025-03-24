import { db } from "@/db";
import { posts, users, postImages } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";
import { v4 as uuidv4 } from "uuid";

export class PostService {
    static async createPost(userId: number, content: string, isTemporary: boolean = false) {
        const userIdNumber = typeof userId === 'string' ? parseInt(userId, 10) : userId;
        
        console.log(`Creating ${isTemporary ? 'temporary' : 'regular'} post, user ID: ${userIdNumber}`);

        const postId = uuidv4();
        console.log("Generated new post ID:", postId);
        
        const [newPost] = await db.insert(posts).values({
            postId,
            userId: userIdNumber,
            content,
            active: true,
            isTemporary: isTemporary === true, // Make sure to store isTemporary flag
            createdAt: new Date(),
            updatedAt: new Date()
        }).returning();
        
        console.log("Post created in database, returning:", newPost);
        
        return newPost;
    }

    static async getAllPosts() {
        const allPosts = await db.query.posts.findMany({
            where: eq(posts.active, true),
            with: {
                user: true,
                images: true,
                comments: {
                    with: {
                        user: true,
                    }
                }
            },
            orderBy: (fields, { desc }) => [desc(fields.createdAt)],
        });
        
        return allPosts;
    }

    static async deletePost(postId: string, userId: number) {
        const post = await db.query.posts.findFirst({
            where: (posts, { and, eq }) => 
                and(
                    eq(posts.postId, postId), 
                    eq(posts.userId, userId),
                    eq(posts.active, true)
                )
        });
        
        if (!post) {
            throw new Error("Post not found or you don't have permission to delete it");
        }
        
        return await db.update(posts)
            .set({ 
                active: false,
                updatedAt: new Date()
            })
            .where(eq(posts.postId, postId))
            .returning();
    }
}
