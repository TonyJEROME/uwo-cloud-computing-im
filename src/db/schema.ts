import { sql } from "drizzle-orm";
import {
    pgTable,
    bigint,
    text,
    timestamp,
    varchar,
    boolean,
    date,
    unique,
    decimal,
    integer,
    uuid,
} from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';
import { InferModel } from 'drizzle-orm';

// Helper for timestamps
const createTimestamps = {
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
};

export const users = pgTable("users", {
    userId: bigint("user_id", { mode: "number" }).primaryKey().notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    isActive: boolean("is_active").default(true),
    isVerified: boolean("is_verified").default(false),
    refreshToken: text("refresh_token"),
    ...createTimestamps,
});

export const posts = pgTable("posts", {
    postId: uuid("post_id").defaultRandom().primaryKey(),
    userId: bigint("user_id", { mode: "number" }).notNull(),
    content: text("content").notNull(),
    likeCount: integer("like_count").default(0),
    active: boolean("active").default(true).notNull(),
    isTemporary: boolean("is_temporary").default(false),
    ...createTimestamps,
});

export const sessions = pgTable("sessions", {
    sessionId: uuid("session_id").defaultRandom().primaryKey(),
    userId: bigint("user_id", { mode: "number" }).notNull(),
    token: text("token").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ...createTimestamps,
});

// Add likes table
export const likes = pgTable("likes", {
    likeId: uuid("like_id").defaultRandom().primaryKey(),
    userId: bigint("user_id", { mode: "number" }).notNull(),
    postId: uuid("post_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => {
    return {
        // Ensure a user can only like a post once
        uniqueLike: unique().on(table.userId, table.postId)
    };
});

// Add images table to schema
export const postImages = pgTable("post_images", {
    imageId: uuid("image_id").defaultRandom().primaryKey(),
    postId: uuid("post_id").notNull().references(() => posts.postId),
    imageUrl: text("image_url").notNull(),
    ...createTimestamps,
});

// 定义表关系
export const usersRelations = relations(users, ({ many }) => ({
    posts: many(posts),
    sessions: many(sessions),
    likes: many(likes),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
    user: one(users, {
        fields: [posts.userId],
        references: [users.userId],
    }),
    likes: many(likes),
    images: many(postImages),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, {
        fields: [sessions.userId],
        references: [users.userId],
    }),
}));

// Define likes relations
export const likesRelations = relations(likes, ({ one }) => ({
    user: one(users, {
        fields: [likes.userId],
        references: [users.userId],
    }),
    post: one(posts, {
        fields: [likes.postId],
        references: [posts.postId],
    }),
}));

// Add image relations
export const postImagesRelations = relations(postImages, ({ one }) => ({
    post: one(posts, {
        fields: [postImages.postId],
        references: [posts.postId],
    }),
}));

// 类型定义
export type User = InferModel<typeof users>;
export type Post = InferModel<typeof posts>;
export type Session = InferModel<typeof sessions>;
export type Like = InferModel<typeof likes>;
export type PostImage = InferModel<typeof postImages>;