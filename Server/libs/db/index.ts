import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
export { schema };

const connectionString =
  process.env.DATABASE_URL ||
  "postgres://admin:Juthani%231@localhost:5432/mf_tracker";

// Disable prefetch as it serves no purpose for a single connection and causes issues with Bun sometimes
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
