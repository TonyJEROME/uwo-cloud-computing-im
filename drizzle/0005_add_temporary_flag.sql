-- Add is_temporary column to posts table
ALTER TABLE "posts" ADD COLUMN "is_temporary" boolean DEFAULT false; 