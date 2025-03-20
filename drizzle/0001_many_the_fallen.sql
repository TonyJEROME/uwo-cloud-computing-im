CREATE TABLE "posts" (
	"post_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" bigint NOT NULL,
	"content" text NOT NULL,
	"like_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"session_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" bigint NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
