import postgres from "postgres";

async function main() {
  console.log('Attempting connection with user "postgres" ...');

  const sql = postgres({
    host: "127.0.0.1",
    port: 5432,
    database: "postgres",
    username: "postgres", // TRYING DEFAULT USER
    password: "Bombus#1",
    max: 1,
  });

  try {
    const dbs = await sql`SELECT 1 as connected`;
    console.log("Connection SUCCESS with user postgres!", dbs);
  } catch (e) {
    console.error("Connection failed with user postgres:", e.message);
  } finally {
    await sql.end();
  }
}

main();
