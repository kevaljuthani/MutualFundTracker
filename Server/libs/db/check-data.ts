import { db, schema } from "./index";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Checking for Fund 122639...");
  const fund = await db
    .select()
    .from(schema.mutualFunds)
    .where(eq(schema.mutualFunds.schemeCode, "122639"));
  console.log("Fund Metadata:", fund);

  const history = await db
    .select()
    .from(schema.navHistory)
    .where(eq(schema.navHistory.schemeCode, "122639"))
    .limit(5);
  console.log("NAV History Sample:", history);

  const latest = await db
    .select()
    .from(schema.latestNav)
    .where(eq(schema.latestNav.schemeCode, "122639"));
  console.log("Latest NAV:", latest);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
