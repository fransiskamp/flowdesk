ALTER TABLE "activities" DROP CONSTRAINT "activities_project_id_projects_id_fk";
--> statement-breakpoint
ALTER TABLE "activities" DROP CONSTRAINT "activities_task_id_tasks_id_fk";
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE set null ON UPDATE no action;