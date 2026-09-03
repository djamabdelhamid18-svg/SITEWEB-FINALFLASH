CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'order_manager' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_username_unique" UNIQUE("username"),
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "order_audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"action" text NOT NULL,
	"previous_status" text,
	"new_status" text NOT NULL,
	"changed_by" text DEFAULT 'admin' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_reservations" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"order_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_reservations_product_id_unique" UNIQUE("product_id"),
	CONSTRAINT "inventory_reservations_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"product_title" text NOT NULL,
	"size" text NOT NULL,
	"color" text,
	"quantity" integer NOT NULL,
	"unit_price" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_number" text NOT NULL,
	"customer_name" text NOT NULL,
	"phone" text NOT NULL,
	"wilaya" text NOT NULL,
	"commune" text DEFAULT '' NOT NULL,
	"delivery_method" text NOT NULL,
	"subtotal" integer NOT NULL,
	"delivery_fee" integer NOT NULL,
	"total" integer NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"price" integer NOT NULL,
	"badge" text,
	"is_one_of_one" boolean DEFAULT false NOT NULL,
	"in_stock" boolean DEFAULT true NOT NULL,
	"stock_count" integer DEFAULT 1 NOT NULL,
	"quality" text,
	"condition_details" text,
	"fabric" text,
	"fit" text,
	"care" text,
	"description" text NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sizes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"colors" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"measurements" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "order_audit_logs" ADD CONSTRAINT "order_audit_logs_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;