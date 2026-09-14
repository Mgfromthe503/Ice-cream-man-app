-- New migration: add driver approval system, availability toggle, and request audit trail
-- This supplements 0000_initial_schema and 0001_vendor_entitlements

-- 1. New enum types
DO $$ BEGIN
  CREATE TYPE "app_role" AS ENUM('customer', 'driver');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
  CREATE TYPE "driver_approval" AS ENUM('not_requested', 'pending', 'approved', 'suspended');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

-- 2. Add columns to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "passwordHash" varchar(255);
--> statement-breakpoint

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "appRole" "app_role" DEFAULT 'customer' NOT NULL;
--> statement-breakpoint

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "driverApproval" "driver_approval" DEFAULT 'not_requested' NOT NULL;
--> statement-breakpoint

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "failedLoginAttempts" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lockedUntil" timestamp;
--> statement-breakpoint

-- 3. Unique index on email (IF NOT EXISTS is not supported for indexes in PG, use DO block)
DO $$ BEGIN
  CREATE UNIQUE INDEX "users_email_idx" ON "users" ("email");
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

-- 4. Driver availability table
CREATE TABLE IF NOT EXISTS "driver_availability" (
  "id" serial PRIMARY KEY NOT NULL,
  "driverId" integer NOT NULL,
  "available" boolean DEFAULT false NOT NULL,
  "latitude" double precision,
  "longitude" double precision,
  "updatedAt" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "driver_availability_driverId_unique" UNIQUE("driverId")
);
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "driver_availability_updated_idx" ON "driver_availability" ("updatedAt");
--> statement-breakpoint

-- 5. Request events table (audit trail)
CREATE TABLE IF NOT EXISTS "request_events" (
  "id" serial PRIMARY KEY NOT NULL,
  "requestId" integer NOT NULL,
  "actorId" integer,
  "fromStatus" "request_status",
  "toStatus" "request_status" NOT NULL,
  "note" varchar(280),
  "createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE INDEX IF NOT EXISTS "request_events_request_idx" ON "request_events" ("requestId", "createdAt");
