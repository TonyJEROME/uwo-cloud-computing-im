import { db } from "@/db";
import { comments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export class CommentService {
    static async createComment(userId: number, postId: string, content: string) {
        const userIdNumber = typeof userId === 'string' ? parseInt(userId, 10) : userId;
        
        console.log(`Creating comment on post ${postId} by user ${userIdNumber}`);

        const commentId = uuidv4();
        
        const [newComment] = await db.insert(comments).values({
            commentId,
            postId,
            userId: userIdNumber,
            content,
            createdAt: new Date(),
            updatedAt: new Date()
        }).returning();
        
        return newComment;
    }

    static async getCommentsForPost(postId: string) {
        return await db.query.comments.findMany({
            where: eq(comments.postId, postId),
            with: {
                user: true,
            },
            orderBy: (fields, { asc }) => [asc(fields.createdAt)],
        });
    }
} 