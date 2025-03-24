-- Create likes table
CREATE TABLE "likes" (
    "like_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" bigint NOT NULL,
    "post_id" uuid NOT NULL,
    "created_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "likes_user_id_post_id_unique" UNIQUE("user_id", "post_id")
); 