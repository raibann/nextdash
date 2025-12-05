DROP TABLE IF EXISTS "invitation" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "member" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "organization" CASCADE;--> statement-breakpoint
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='session' AND column_name='impersonated_by') THEN
        ALTER TABLE "session" ADD COLUMN "impersonated_by" text;
    END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user' AND column_name='role') THEN
        ALTER TABLE "user" ADD COLUMN "role" text;
    END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user' AND column_name='banned') THEN
        ALTER TABLE "user" ADD COLUMN "banned" boolean DEFAULT false;
    END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user' AND column_name='ban_reason') THEN
        ALTER TABLE "user" ADD COLUMN "ban_reason" text;
    END IF;
END $$;--> statement-breakpoint
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='user' AND column_name='ban_expires') THEN
        ALTER TABLE "user" ADD COLUMN "ban_expires" timestamp;
    END IF;
END $$;--> statement-breakpoint
ALTER TABLE "session" DROP COLUMN IF EXISTS "active_organization_id";
