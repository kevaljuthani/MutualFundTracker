CREATE TABLE IF NOT EXISTS "latest_nav" (
	"scheme_code" text PRIMARY KEY NOT NULL,
	"nav" double precision NOT NULL,
	"nav_date" timestamp NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mutual_funds" (
	"scheme_code" text PRIMARY KEY NOT NULL,
	"scheme_name" text NOT NULL,
	"fund_house" text,
	"category" text,
	"inception_date" timestamp,
	"raw_json" jsonb,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nav_history" (
	"scheme_code" text,
	"nav_date" timestamp NOT NULL,
	"nav" double precision NOT NULL,
	CONSTRAINT "nav_history_scheme_code_nav_date_pk" PRIMARY KEY("scheme_code","nav_date")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "latest_nav" ADD CONSTRAINT "latest_nav_scheme_code_mutual_funds_scheme_code_fk" FOREIGN KEY ("scheme_code") REFERENCES "mutual_funds"("scheme_code") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nav_history" ADD CONSTRAINT "nav_history_scheme_code_mutual_funds_scheme_code_fk" FOREIGN KEY ("scheme_code") REFERENCES "mutual_funds"("scheme_code") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
