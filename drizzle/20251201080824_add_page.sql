CREATE TABLE "page" (
	"id" text PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(150) NOT NULL,
	"icon" varchar(50),
	"parent_id" text,
	"order_index" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "page_slug_unique" UNIQUE("slug")
);
