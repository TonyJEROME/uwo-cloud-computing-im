import { db } from "@/db";
import { posts, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";
import { v4 as uuidv4 } from "uuid";

export class PostService {
    static async createPost(userId: number, content: string) {
        const userIdNumber = typeof userId === 'string' ? parseInt(userId, 10) : userId;
        
        console.log("创建帖子，用户ID类型:", typeof userIdNumber, "值:", userIdNumber);

        const postId = uuidv4();
        
        return await db.insert(posts).values({
            postId,
            userId: userIdNumber,
            content,
            createdAt: new Date(),
            updatedAt: new Date()
        }).returning();
    }

    static async getAllPosts() {
        return await db.query.posts.findMany({
            with: {
                user: true,
            },
            orderBy: (fields, { desc }) => [desc(fields.createdAt)],
        });
    }

    static async deletePost(postId: string, userId: number) {
        const post = await db.query.posts.findFirst({
            where: (posts, { and, eq }) => 
                and(eq(posts.postId, postId), eq(posts.userId, userId))
        });
        
        if (!post) {
            throw new Error("Post not found or you don't have permission to delete it");
        }
        
        return await db.delete(posts).where(eq(posts.postId, postId)).returning();
    }
}
