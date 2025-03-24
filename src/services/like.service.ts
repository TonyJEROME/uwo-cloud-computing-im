import { db } from "@/db";
import { likes, posts } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";

export class LikeService {
    static async toggleLike(userId: number, postId: string) {
        // Check if user already liked the post
        const existingLike = await db.query.likes.findFirst({
            where: and(
                eq(likes.userId, userId),
                eq(likes.postId, postId)
            ),
        });

        // Start a transaction to ensure data consistency
        return await db.transaction(async (tx) => {
            if (existingLike) {
                // If like exists, remove it (unlike)
                await tx.delete(likes).where(
                    and(
                        eq(likes.userId, userId),
                        eq(likes.postId, postId)
                    )
                );
                
                // Decrement like count
                await tx.update(posts)
                    .set({ 
                        likeCount: sql`${posts.likeCount} - 1`,
                        updatedAt: new Date()
                    })
                    .where(eq(posts.postId, postId));
                
                return { liked: false };
            } else {
                // If like doesn't exist, add it
                await tx.insert(likes).values({
                    userId,
                    postId,
                    createdAt: new Date(),
                });
                
                // Increment like count
                await tx.update(posts)
                    .set({ 
                        likeCount: sql`${posts.likeCount} + 1`,
                        updatedAt: new Date()
                    })
                    .where(eq(posts.postId, postId));
                
                return { liked: true };
            }
        });
    }

    static async getLikeStatus(userId: number, postId: string) {
        const like = await db.query.likes.findFirst({
            where: and(
                eq(likes.userId, userId),
                eq(likes.postId, postId)
            ),
        });
        
        return { liked: !!like };
    }
    
    static async getLikeCount(postId: string) {
        const post = await db.query.posts.findFirst({
            where: eq(posts.postId, postId),
            columns: { likeCount: true }
        });
        
        return post?.likeCount || 0;
    }
} 