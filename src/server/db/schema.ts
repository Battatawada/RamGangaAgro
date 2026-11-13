import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/* Business tables used by Phase 1 ------------------------------------- */

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkUserId: text("clerk_user_id").notNull().unique(),
    role: text("role").notNull().default("customer"),
    email: text("email"),
    name: text("name"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check("users_role_check", sql`${table.role} in ('customer', 'admin')`),
  ],
);

export const subscribers = pgTable("subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  consentAt: timestamp("consent_at", { withTimezone: true }).notNull(),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
  source: text("source").notNull(),
  tokenHash: text("token_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** The running app may INSERT here. It may not SELECT. See docs/19 grants. */
export const contactMessages = pgTable("contact_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const webhookEvents = pgTable(
  "webhook_events",
  {
    provider: text("provider").notNull(),
    eventId: text("event_id").notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.eventId] }),
  ],
);

/**
 * Fixed-window counters for public form writes. The key is an operation and a
 * client address, never an email address. The app role may maintain these
 * rows. The inbox reader and the privacy login may not.
 */
export const rateLimitBuckets = pgTable(
  "rate_limit_buckets",
  {
    bucketKey: text("bucket_key").primaryKey(),
    hitCount: integer("hit_count").notNull(),
    resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    check("rate_limit_buckets_count_check", sql`${table.hitCount} > 0`),
    index("rate_limit_buckets_reset_at_idx").on(table.resetAt),
  ],
);

/** Append only. The app role has no UPDATE or DELETE on this table. */
export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorClerkUserId: text("actor_clerk_user_id"),
  action: text("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id"),
  note: jsonb("note"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/* Tables created empty so later commerce does not invent a second schema. */

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    summary: text("summary"),
    status: text("status").notNull(),
    purchasable: boolean("purchasable").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "products_status_check",
      sql`${table.status} in ('currently_growing', 'seasonal_harvest', 'coming_soon', 'available_soon')`,
    ),
  ],
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    sku: text("sku").notNull().unique(),
    pricePaise: integer("price_paise").notNull(),
    weightGrams: integer("weight_grams"),
    active: boolean("active").notNull().default(false),
  },
  (table) => [
    check("product_variants_price_check", sql`${table.pricePaise} >= 0`),
    check("product_variants_weight_check", sql`${table.weightGrams} > 0`),
    index("product_variants_product_id_idx").on(table.productId),
  ],
);

export const harvests = pgTable(
  "harvests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    batchCode: text("batch_code").notNull().unique(),
    harvestedOn: date("harvested_on"),
    fieldLabel: text("field_label"),
    notes: text("notes"),
    isPublic: boolean("is_public").notNull().default(false),
  },
  (table) => [index("harvests_product_id_idx").on(table.productId)],
);

export const inventory = pgTable(
  "inventory",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "restrict" }),
    harvestId: uuid("harvest_id").references(() => harvests.id, {
      onDelete: "restrict",
    }),
    quantity: integer("quantity").notNull().default(0),
  },
  (table) => [check("inventory_quantity_check", sql`${table.quantity} >= 0`)],
);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "restrict" }),
    email: text("email"),
    status: text("status").notNull().default("pending"),
    totalPaise: integer("total_paise").notNull().default(0),
    currency: text("currency").notNull().default("INR"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check("orders_total_check", sql`${table.totalPaise} >= 0`),
    check(
      "orders_identity_check",
      sql`${table.userId} is not null or ${table.email} is not null`,
    ),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "restrict" }),
    harvestId: uuid("harvest_id").references(() => harvests.id, {
      onDelete: "restrict",
    }),
    quantity: integer("quantity").notNull(),
    unitPricePaise: integer("unit_price_paise").notNull(),
  },
  (table) => [
    check("order_items_quantity_check", sql`${table.quantity} > 0`),
    check("order_items_price_check", sql`${table.unitPricePaise} >= 0`),
    index("order_items_order_id_idx").on(table.orderId),
  ],
);

export const addresses = pgTable(
  "addresses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    line1: text("line1").notNull(),
    line2: text("line2"),
    city: text("city").notNull(),
    region: text("region"),
    postalCode: text("postal_code"),
    country: text("country").notNull(),
    isDefault: boolean("is_default").notNull().default(false),
  },
  (table) => [index("addresses_user_id_idx").on(table.userId)],
);

export const media = pgTable(
  "media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kind: text("kind").notNull(),
    src: text("src").notNull(),
    alt: text("alt"),
    poster: text("poster"),
  },
  (table) => [
    check(
      "media_kind_check",
      sql`${table.kind} in ('illustration', 'image', 'video')`,
    ),
  ],
);
