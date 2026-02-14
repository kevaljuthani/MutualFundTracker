import {
  pgTable,
  serial,
  text,
  timestamp,
  jsonb,
  doublePrecision,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const mutualFunds = pgTable("mutual_funds", {
  schemeCode: text("scheme_code").primaryKey(),
  schemeName: text("scheme_name").notNull(),
  fundHouse: text("fund_house"),
  category: text("category"),
  inceptionDate: timestamp("inception_date"),
  rawJson: jsonb("raw_json"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const navHistory = pgTable(
  "nav_history",
  {
    schemeCode: text("scheme_code").references(() => mutualFunds.schemeCode),
    navDate: timestamp("nav_date").notNull(),
    nav: doublePrecision("nav").notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.schemeCode, table.navDate] }),
    };
  },
);

export const latestNav = pgTable("latest_nav", {
  schemeCode: text("scheme_code")
    .primaryKey()
    .references(() => mutualFunds.schemeCode),
  nav: doublePrecision("nav").notNull(),
  navDate: timestamp("nav_date").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .references(() => users.id)
    .notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const holdings = pgTable("holdings", {
  id: serial("id").primaryKey(),
  portfolioId: serial("portfolio_id")
    .references(() => portfolios.id)
    .notNull(),
  schemeCode: text("scheme_code")
    .references(() => mutualFunds.schemeCode)
    .notNull(),
  units: doublePrecision("units").notNull(),
  averagePrice: doublePrecision("average_price"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  portfolioId: serial("portfolio_id")
    .references(() => portfolios.id)
    .notNull(),
  schemeCode: text("scheme_code")
    .references(() => mutualFunds.schemeCode)
    .notNull(),
  type: text("type").notNull(), // 'BUY' or 'SELL'
  units: doublePrecision("units").notNull(),
  pricePerUnit: doublePrecision("price_per_unit").notNull(),
  amount: doublePrecision("amount").notNull(),
  date: timestamp("date").defaultNow().notNull(),
});
