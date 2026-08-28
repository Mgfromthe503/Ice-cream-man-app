-- New migration: add the 'arrived' request status used by the app.
-- The schema (drizzle/schema.ts) expects request_status to include 'arrived'
-- (between 'in_transit' and 'completed'), but the base 0000 migration was
-- committed without it. PostgreSQL 15 supports ALTER TYPE ... ADD VALUE
-- outside a transaction block, which is what we do here.
ALTER TYPE "request_status" ADD VALUE IF NOT EXISTS 'arrived';
--> statement-breakpoint
