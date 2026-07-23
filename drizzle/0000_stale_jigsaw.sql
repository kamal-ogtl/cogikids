CREATE TABLE "cogi_ledger" (
	"id" serial PRIMARY KEY NOT NULL,
	"kid_id" integer NOT NULL,
	"total_earned" integer DEFAULT 0 NOT NULL,
	"total_minted" integer DEFAULT 0 NOT NULL,
	"pending_mint" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cogi_mint_queue" (
	"id" serial PRIMARY KEY NOT NULL,
	"kid_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"reason" varchar(32) NOT NULL,
	"status" varchar(16) DEFAULT 'pending' NOT NULL,
	"tx_hash" varchar(64),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "kid_node_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"kid_id" integer NOT NULL,
	"node_id" varchar(32) NOT NULL,
	"unlocked" boolean DEFAULT true NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"stars" integer DEFAULT 0 NOT NULL,
	"high_score" integer DEFAULT 0 NOT NULL,
	"last_played_at" timestamp,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "kid_players" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(64) NOT NULL,
	"age_group" varchar(16) NOT NULL,
	"native_language" varchar(16) NOT NULL,
	"avatar_url" varchar(256),
	"level" integer DEFAULT 1 NOT NULL,
	"xp" integer DEFAULT 0 NOT NULL,
	"streak_days" integer DEFAULT 0 NOT NULL,
	"total_stars" integer DEFAULT 0 NOT NULL,
	"password_hash" varchar(256) NOT NULL,
	"last_active_date" date,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "parent_wallets" (
	"id" serial PRIMARY KEY NOT NULL,
	"kid_id" integer NOT NULL,
	"wallet_address" varchar(128) NOT NULL,
	"network" varchar(16) DEFAULT 'preprod' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "cogi_ledger" ADD CONSTRAINT "cogi_ledger_kid_id_kid_players_id_fk" FOREIGN KEY ("kid_id") REFERENCES "public"."kid_players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cogi_mint_queue" ADD CONSTRAINT "cogi_mint_queue_kid_id_kid_players_id_fk" FOREIGN KEY ("kid_id") REFERENCES "public"."kid_players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kid_node_progress" ADD CONSTRAINT "kid_node_progress_kid_id_kid_players_id_fk" FOREIGN KEY ("kid_id") REFERENCES "public"."kid_players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parent_wallets" ADD CONSTRAINT "parent_wallets_kid_id_kid_players_id_fk" FOREIGN KEY ("kid_id") REFERENCES "public"."kid_players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_kid_node" ON "kid_node_progress" USING btree ("kid_id","node_id");