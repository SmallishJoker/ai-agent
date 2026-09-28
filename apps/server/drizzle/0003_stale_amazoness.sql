ALTER TABLE "conversations" ADD COLUMN "user_id" text DEFAULT 'demo-user' NOT NULL;--> statement-breakpoint
CREATE INDEX "conversations_user_id_idx" ON "conversations" USING btree ("user_id");