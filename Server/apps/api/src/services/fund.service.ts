import { db, schema } from "@mf-tracker/db";
import { eq, sql, desc, and, gte } from "drizzle-orm";

export class FundService {
  async searchFunds(query: string, limit = 20) {
    if (!query) return [];
    return db
      .select({
        schemeCode: schema.mutualFunds.schemeCode,
        schemeName: schema.mutualFunds.schemeName,
        fundHouse: schema.mutualFunds.fundHouse,
        category: schema.mutualFunds.category,
      })
      .from(schema.mutualFunds)
      .where(
        sql`lower(${schema.mutualFunds.schemeName}) like ${"%" + query.toLowerCase() + "%"}`,
      )
      .limit(limit);
  }

  async getFeaturedFunds(limit = 10) {
    // Since we don't have ratings, we'll pick funds with 'Direct' and 'Growth' in name
    // as a proxy for "good" funds often sought after, randomized.
    // In a real app, this would query a 'rating' column or 'popularity' table.
    return db
      .select({
        schemeCode: schema.mutualFunds.schemeCode,
        schemeName: schema.mutualFunds.schemeName,
        fundHouse: schema.mutualFunds.fundHouse,
        category: schema.mutualFunds.category,
      })
      .from(schema.mutualFunds)
      .where(
        sql`lower(${schema.mutualFunds.schemeName}) like '%direct%growth%'`,
      )
      .limit(limit);
    // Note: Random features in SQL can be expensive (ORDER BY RANDOM()), keeping it simple for now.
  }

  async getAllFunds(limit = 20, offset = 0) {
    return db
      .select({
        schemeCode: schema.mutualFunds.schemeCode,
        schemeName: schema.mutualFunds.schemeName,
        fundHouse: schema.mutualFunds.fundHouse,
        category: schema.mutualFunds.category,
      })
      .from(schema.mutualFunds)
      .limit(limit)
      .offset(offset);
  }

  async getFundDetails(schemeCode: string) {
    const [fund] = await db
      .select()
      .from(schema.mutualFunds)
      .where(eq(schema.mutualFunds.schemeCode, schemeCode))
      .limit(1);

    if (!fund) return null;

    const [latest] = await db
      .select()
      .from(schema.latestNav)
      .where(eq(schema.latestNav.schemeCode, schemeCode))
      .limit(1);

    return {
      ...fund,
      latestNav: latest?.nav || null,
      latestNavDate: latest?.navDate || null,
    };
  }

  async getHistory(
    schemeCode: string,
    period: "1M" | "3M" | "6M" | "1Y" | "3Y" | "5Y" | "ALL",
  ) {
    let startDate: Date;
    const now = new Date();

    switch (period) {
      case "1M":
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case "3M":
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case "6M":
        startDate = new Date(now.setMonth(now.getMonth() - 6));
        break;
      case "1Y":
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      case "3Y":
        startDate = new Date(now.setFullYear(now.getFullYear() - 3));
        break;
      case "5Y":
        startDate = new Date(now.setFullYear(now.getFullYear() - 5));
        break;
      case "ALL":
        startDate = new Date(0);
        break; // Epoch
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    return db
      .select({
        date: schema.navHistory.navDate,
        nav: schema.navHistory.nav,
      })
      .from(schema.navHistory)
      .where(
        and(
          eq(schema.navHistory.schemeCode, schemeCode),
          gte(schema.navHistory.navDate, startDate),
        ),
      )
      .orderBy(schema.navHistory.navDate);
  }
}
