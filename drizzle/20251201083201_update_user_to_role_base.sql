ALTER TABLE "user_role" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "user_role" CASCADE;--> statement-breakpoint
ALTER TABLE "role" ALTER COLUMN "icon" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" text;--> statement-breakpoint
ALTER TABLE "role" ADD COLUMN "slug" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "role" ADD CONSTRAINT "role_slug_unique" UNIQUE("slug");