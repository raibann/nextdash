ALTER TABLE "permission" ADD COLUMN "slug" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "permission" ADD CONSTRAINT "permission_slug_unique" UNIQUE("slug");