-- Create comments table
CREATE TABLE "comments" (
    "comment_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "post_id" uuid NOT NULL REFERENCES "posts"("post_id"),
    "user_id" bigint NOT NULL REFERENCES "users"("user_id"),
    "content" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
);

-- Add index for faster lookups
CREATE INDEX "comments_post_id_idx" ON "comments" ("post_id"); 