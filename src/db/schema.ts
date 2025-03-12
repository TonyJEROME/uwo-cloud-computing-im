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