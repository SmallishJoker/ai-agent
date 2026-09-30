ALTER TABLE "agent_runs" DROP CONSTRAINT "agent_runs_conversation_id_conversations_id_fk";
--> statement-breakpoint
ALTER TABLE "agent_steps" DROP CONSTRAINT "agent_steps_run_id_agent_runs_run_id_fk";
--> statement-breakpoint
ALTER TABLE "agent_runs" ADD CONSTRAINT "agent_runs_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_steps" ADD CONSTRAINT "agent_steps_run_id_agent_runs_run_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."agent_runs"("run_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "agent_steps_run_id_step_index_idx" ON "agent_steps" USING btree ("run_id","step_index");