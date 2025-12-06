ALTER TABLE "user_role" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE IF EXISTS "user_role" CASCADE;--> statement-breakpoint
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='role' AND column_name='slug') THEN
        -- Add slug column as nullable first
        ALTER TABLE "role" ADD COLUMN "slug" varchar(100);
        -- Set default slug for existing roles (using name as slug)
        UPDATE "role" SET "slug" = LOWER(REPLACE("name", ' ', '-')) WHERE "slug" IS NULL;
        -- Now make it NOT NULL
        ALTER TABLE "role" ALTER COLUMN "slug" SET NOT NULL;
    END IF;
END $$;--> statement-breakpoint
-- Clear existing role values that don't match role.id before adding constraint
UPDATE "user" SET "role" = NULL WHERE "role" IS NOT NULL AND "role" NOT IN (SELECT id FROM "role");--> statement-breakpoint
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema='public' 
        AND constraint_name='user_role_role_id_fk'
    ) THEN
        ALTER TABLE "user" ADD CONSTRAINT "user_role_role_id_fk" FOREIGN KEY ("role") REFERENCES "public"."role"("id") ON DELETE set null ON UPDATE no action;
    END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema='public' 
        AND constraint_name='role_slug_unique'
    ) THEN
        ALTER TABLE "role" ADD CONSTRAINT "role_slug_unique" UNIQUE("slug");
    END IF;
END $$;
