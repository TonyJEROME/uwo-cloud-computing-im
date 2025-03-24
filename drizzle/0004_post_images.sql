-- Create post_images table
CREATE TABLE "post_images" (
    "image_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "post_id" uuid NOT NULL REFERENCES "posts"("post_id"),
    "image_url" text NOT NULL,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
); 