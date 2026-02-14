import { CronJob } from "cron";
import { fetchAllSchemes, upsertSchemes, fetchAndIngestFund } from "./ingest";
import { db, schema } from "@mf-tracker/db";
import { sql, eq, or, isNull, gte } from "drizzle-orm";

// Helper: Get funds from active user portfolios
async function getActiveFunds() {
  const activeFunds = await db
    .selectDistinct({ schemeCode: schema.holdings.schemeCode })
    .from(schema.holdings);

  return activeFunds;
}

// Helper: Get recently accessed funds (searched/viewed in last 48 hours)
async function getRecentlyAccessedFunds() {
  const twoDaysAgo = new Date();
  twoDaysAgo.setHours(twoDaysAgo.getHours() - 48);

  const recentFunds = await db
    .select({ schemeCode: schema.mutualFunds.schemeCode })
    .from(schema.mutualFunds)
    .where(sql`${schema.mutualFunds.updatedAt} >= ${twoDaysAgo}`)
    .limit(200); // Cap to avoid overwhelming the hourly job

  return recentFunds;
}

// Ingest Metadata Daily at 2 AM
const metadataJob = new CronJob("0 2 * * *", async () => {
  console.log("Running daily metadata sync...");
  try {
    const schemes = await fetchAllSchemes();
    await upsertSchemes(schemes);
    console.log("Daily metadata sync done.");
  } catch (e) {
    console.error("Metadata sync failed", e);
  }
});

// Hourly: Update Active Holdings + Recently Accessed Funds
const navJob = new CronJob("0 * * * *", async () => {
  console.log("Running hourly NAV sync (active + recent)...");
  try {
    const activeFunds = await getActiveFunds();
    const recentFunds = await getRecentlyAccessedFunds();

    // Combine and deduplicate
    const allFunds = [...activeFunds, ...recentFunds];
    const uniqueFunds = Array.from(
      new Map(allFunds.map((f) => [f.schemeCode, f])).values(),
    );

    if (uniqueFunds.length === 0) {
      console.log("No active or recent funds to update.");
      return;
    }

    console.log(
      `Updating NAV for ${uniqueFunds.length} funds (${activeFunds.length} active, ${recentFunds.length} recent)...`,
    );

    // Process in batches
    const batchSize = 10;
    for (let i = 0; i < uniqueFunds.length; i += batchSize) {
      const batch = uniqueFunds.slice(i, i + batchSize);
      await Promise.all(batch.map((f) => fetchAndIngestFund(f.schemeCode)));
      await new Promise((r) => setTimeout(r, 200));
    }

    console.log("Hourly NAV sync complete.");
  } catch (e) {
    console.error("Hourly NAV sync failed:", e);
  }
});

// Daily: Full Universe Sync at 3 AM (after metadata sync)
const dailyFullNavJob = new CronJob("0 3 * * *", async () => {
  console.log("Running daily FULL NAV sync for active funds...");
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const allFunds = await db
      .select({ schemeCode: schema.mutualFunds.schemeCode })
      .from(schema.mutualFunds)
      .leftJoin(
        schema.latestNav,
        eq(schema.mutualFunds.schemeCode, schema.latestNav.schemeCode),
      )
      .where(
        or(
          isNull(schema.latestNav.navDate),
          gte(schema.latestNav.navDate, oneMonthAgo),
        ),
      );

    console.log(`Processing NAV for ${allFunds.length} funds...`);

    const batchSize = 20; // Higher batch for daily job
    for (let i = 0; i < allFunds.length; i += batchSize) {
      const batch = allFunds.slice(i, i + batchSize);
      await Promise.all(batch.map((f) => fetchAndIngestFund(f.schemeCode)));
      await new Promise((r) => setTimeout(r, 100));

      if (i % 500 === 0) {
        console.log(`Daily NAV: Processed ${i} / ${allFunds.length} funds...`);
      }
    }

    console.log("Daily full NAV sync complete.");
  } catch (e) {
    console.error("Daily full NAV sync failed:", e);
  }
});

metadataJob.start();
navJob.start();
dailyFullNavJob.start();

console.log("Sync Service Scheduled.");

// Backfill Handler
async function runFullBackfill() {
  console.log("Starting full backfill...");
  try {
    const schemes = await fetchAllSchemes();
    await upsertSchemes(schemes);

    console.log(`Ingesting details for ${schemes.length} schemes...`);

    console.log(`Ingesting details for ${schemes.length} schemes...`);

    // Process all schemes in batches
    const batchSize = 10; // Concurrent requests
    for (let i = 0; i < schemes.length; i += batchSize) {
      const batch = schemes.slice(i, i + batchSize);
      await Promise.all(
        batch.map((s) => fetchAndIngestFund(String(s.schemeCode))),
      );

      // Small delay to be nice to the API
      await new Promise((r) => setTimeout(r, 100));

      if (i % 100 === 0) {
        console.log(`Processed ${i} / ${schemes.length} schemes...`);
      }
    }
    console.log("Full backfill complete.");
  } catch (e) {
    console.error("Backfill failed:", e);
  }
}

if (process.argv.includes("--backfill")) {
  runFullBackfill();
}
