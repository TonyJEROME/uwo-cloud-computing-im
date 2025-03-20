CREATE TABLE IF NOT EXISTS "users" (
    "user_id" bigint PRIMARY KEY NOT NULL,
    "email" varchar(255) NOT NULL,
    "password_hash" varchar(255) NOT NULL,
    "first_name" varchar(100) NOT NULL,
    "last_name" varchar(100) NOT NULL,
    "phone" varchar(20),
    "is_active" boolean DEFAULT true,
    "is_verified" boolean DEFAULT false,
    "refresh_token" text,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "users_email_unique" UNIQUE("email")
);

CREATE TABLE IF NOT EXISTS "posts" (
    "post_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" bigint NOT NULL,
    "content" text NOT NULL,
    "like_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "sessions" (
    "session_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" bigint NOT NULL,
    "token" text NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now()
);