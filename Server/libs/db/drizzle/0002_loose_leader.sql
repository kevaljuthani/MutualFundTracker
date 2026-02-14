CREATE TABLE IF NOT EXISTS "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"portfolio_id" serial NOT NULL,
	"scheme_code" text NOT NULL,
	"type" text NOT NULL,
	"units" double precision NOT NULL,
	"price_per_unit" double precision NOT NULL,
	"amount" double precision NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_portfolio_id_portfolios_id_fk" FOREIGN KEY ("portfolio_id") REFERENCES "portfolios"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_scheme_code_mutual_funds_scheme_code_fk" FOREIGN KEY ("scheme_code") REFERENCES "mutual_funds"("scheme_code") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
