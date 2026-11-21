ALTER TABLE "products" ADD COLUMN "category" text DEFAULT 'grains' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "shipping_class" text DEFAULT 'dry' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "ingredients" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "allergens" text;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_check" CHECK ("products"."category" in ('grains', 'dairy', 'other'));--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_shipping_class_check" CHECK ("products"."shipping_class" in ('dry', 'shelf_stable', 'chilled'));--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_dairy_allergens_check" CHECK ("products"."category" <> 'dairy' or "products"."allergens" is not null or "products"."purchasable" = false);--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN "volume_ml" integer;--> statement-breakpoint
ALTER TABLE "product_variants" DROP CONSTRAINT IF EXISTS "product_variants_weight_check";--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_measure_check" CHECK (("product_variants"."weight_grams" > 0 or "product_variants"."volume_ml" > 0));--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_paise" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "provider" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "provider_order_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "provider_payment_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_shipping_check" CHECK ("orders"."shipping_paise" >= 0);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_user_id_idx" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "orders_provider_order_id_idx" ON "orders" USING btree ("provider_order_id");--> statement-breakpoint
CREATE TABLE "order_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"line1" text NOT NULL,
	"line2" text,
	"city" text NOT NULL,
	"region" text,
	"postal_code" text NOT NULL,
	"country" text DEFAULT 'IN' NOT NULL,
	"phone" text NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "order_addresses_order_id_unique" UNIQUE("order_id")
);--> statement-breakpoint
ALTER TABLE "order_addresses" ADD CONSTRAINT "order_addresses_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "order_addresses_order_id_idx" ON "order_addresses" USING btree ("order_id");--> statement-breakpoint
CREATE TABLE "order_access_tokens" (
	"order_id" uuid PRIMARY KEY NOT NULL,
	"token_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "order_access_tokens" ADD CONSTRAINT "order_access_tokens_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;