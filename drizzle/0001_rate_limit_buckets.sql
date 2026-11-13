CREATE TABLE "rate_limit_buckets" (
	"bucket_key" text PRIMARY KEY NOT NULL,
	"hit_count" integer NOT NULL,
	"reset_at" timestamp with time zone NOT NULL,
	CONSTRAINT "rate_limit_buckets_count_check" CHECK ("rate_limit_buckets"."hit_count" > 0)
);
--> statement-breakpoint
CREATE INDEX "rate_limit_buckets_reset_at_idx" ON "rate_limit_buckets" USING btree ("reset_at");