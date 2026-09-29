CREATE EXTENSION IF NOT EXISTS vector;--> statement-breakpoint
ALTER TABLE "user_memories" ADD COLUMN "embedding" vector(1536);
