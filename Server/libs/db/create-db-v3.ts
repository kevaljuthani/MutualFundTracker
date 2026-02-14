import postgres from "postgres";

async function main() {
  console.log(
    "Connecting to Postgres admin database (127.0.0.1) with Juthani#1...",
  );

  const sql = postgres({
    host: "127.0.0.1",
    port: 5432,
    database: "postgres",
    username: "admin",
    password: "Juthani#1",
    max: 1,
  });

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
    if (e instanceof Error) {
      console.error("Message:", e.message);
    }
  } finally {
    await sql.end();
  }
}

main();
