import postgres from "postgres";

const adminConnectionString =
  process.env.DATABASE_URL?.replace("/mf_tracker", "/postgres") ||
  "postgres://admin:Bombus%231@localhost:5432/postgres";

async function main() {
  console.log("Connecting to Postgres admin database...");
  const sql = postgres(adminConnectionString);

  try {
    const dbs =
      await sql`SELECT datname FROM pg_database WHERE datname = 'mf_tracker'`;
    if (dbs.length === 0) {
      console.log("Database mf_tracker does not exist. Creating...");
      await sql`CREATE DATABASE mf_tracker`;
      console.log("Database mf_tracker created successfully.");
    } else {
      console.log("Database mf_tracker already exists.");
    }
  } catch (e) {
    console.error("Error creating database:", e);
  } finally {
    await sql.end();
  }
}

main();
