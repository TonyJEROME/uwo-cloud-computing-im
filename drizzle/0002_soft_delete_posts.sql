-- Add active column to posts table
ALTER TABLE "posts" ADD COLUMN "active" boolean DEFAULT true NOT NULL; 