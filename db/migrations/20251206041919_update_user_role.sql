ALTER TABLE "page" DROP CONSTRAINT "page_parent_id_page_id_fk";
--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_role_role_id_fk";
--> statement-breakpoint
ALTER TABLE "page" ADD CONSTRAINT "page_parent_id_page_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."page"("id") ON DELETE set null ON UPDATE no action;