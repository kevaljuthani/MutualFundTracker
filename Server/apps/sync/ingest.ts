import { db, schema } from "@mf-tracker/db";
import { sql } from "drizzle-orm";

const MF_API_URL = "https://api.mfapi.in/mf";

export async function fetchAllSchemes() {
  console.log("Fetching all schemes list...");
  const response = await fetch(MF_API_URL);
  if (!response.ok) throw new Error("Failed to fetch schemes");

  const data = (await response.json()) as Array<{
    schemeCode: number;
    schemeName: string;
  }>;
  console.log(`Fetched ${data.length} schemes.`);
  return data;
}

export async function upsertSchemes(
  schemes: Array<{ schemeCode: number; schemeName: string }>,
) {
  console.log("Upserting schemes metadata...");
  // Process in batches
  const batchSize = 100;
  for (let i = 0; i < schemes.length; i += batchSize) {
    const batch = schemes.slice(i, i + batchSize).map((s) => ({
      schemeCode: String(s.schemeCode),
      schemeName: s.schemeName,
      updatedAt: new Date(),
    }));

    await db
      .insert(schema.mutualFunds)
      .values(batch)
      .onConflictDoUpdate({
        target: schema.mutualFunds.schemeCode,
        set: { schemeName: sql`EXCLUDED.scheme_name`, updatedAt: new Date() },
      });
  }
  console.log("Schemes upsert complete.");
}

export async function fetchAndIngestFund(schemeCode: string) {
  try {
    const response = await fetch(`${MF_API_URL}/${schemeCode}`);
    if (!response.ok) return;

    const data = await response.json();
    if (!data || !data.meta) return;

    // 1. Update Metadata
    await db
      .update(schema.mutualFunds)
      .set({
        fundHouse: data.meta.fund_house,
        category: data.meta.scheme_category,
        rawJson: data.meta,
        updatedAt: new Date(),
      })
      .where(sql`${schema.mutualFunds.schemeCode} = ${schemeCode}`);

    // 2. Insert NAV History
    if (data.data && Array.isArray(data.data)) {
      const navs = data.data
        .map((item: any) => ({
          schemeCode,
          navDate: new Date(item.date.split("-").reverse().join("-")), // DD-MM-YYYY -> YYYY-MM-DD
          nav: parseFloat(item.nav),
        }))
        .filter((n: any) => !isNaN(n.nav));

      if (navs.length > 0) {
        // Sort by date to get latest
        navs.sort(
          (a: any, b: any) => b.navDate.getTime() - a.navDate.getTime(),
        );
        const latest = navs[0];

        // Upsert Latest NAV
        await db
          .insert(schema.latestNav)
          .values({
            schemeCode,
            nav: latest.nav,
            navDate: latest.navDate,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: schema.latestNav.schemeCode,
            set: {
              nav: latest.nav,
              navDate: latest.navDate,
              updatedAt: new Date(),
            },
          });

        // Bulk Insert History (Ignore conflicts)
        // We use a simplified approach: Insert and ignore on conflict
        // For bulk, doing it in chunks is safe
        const historyBatchSize = 500;
        for (let j = 0; j < navs.length; j += historyBatchSize) {
          const chunk = navs.slice(j, j + historyBatchSize);
          await db
            .insert(schema.navHistory)
            .values(chunk)
            .onConflictDoNothing();
        }
      }
    }
  } catch (e) {
    console.error(`Error processing ${schemeCode}:`, e);
  }
}
