import { db, schema } from "@mf-tracker/db";
import { eq, and, sql, desc } from "drizzle-orm";
import xirr from "xirr";

// Helper to calculate XIRR safely
// Helper to calculate XIRR safely
function calculateXirr(
  transactions: { amount: number; date: Date }[],
  currentValue: number,
) {
  if (transactions.length === 0) return 0;

  // XIRR expects:
  // - Negative values for outflows (investments)
  // - Positive values for inflows (withdrawals) + Current Value (as if sold today)

  const cashFlows = transactions.map((t) => ({
    amount: -t.amount, // Investment is outflow
    when: t.date,
  }));

  // Add current value as a positive cash flow "today"
  cashFlows.push({
    amount: currentValue,
    when: new Date(),
  });

  // Basic Validation: Must have at least one positive and one negative value
  const hasPositive = cashFlows.some((cf) => cf.amount > 0);
  const hasNegative = cashFlows.some((cf) => cf.amount < 0);

  if (!hasPositive || !hasNegative) {
    return 0; // XIRR cannot be calculated without both signs
  }

  try {
    // Attempt calculation with default guess
    const result = xirr(cashFlows);
    return result * 100;
  } catch (e) {
    // If it fails (likely convergence error), try with a different guess or options if supported
    // The 'xirr' package used here (from imports) might strictly be the 'xirr' npm package
    // which has signature xirr(transactions, options?).
    // Let's try to provide a guess if the library supports it, or just return 0.

    // Attempt with a different guess (e.g., 10%)
    try {
      const result = xirr(cashFlows, { guess: 0.1 });
      return result * 100;
    } catch (retryError) {
      console.warn("XIRR Calculation Failed:", e);
      // Fallback: Return 0 or Absolute Return % as a proxy if appropriate,
      // but 0 is safer to indicate "not available".
      return 0;
    }
  }
}

export class PortfolioService {
  // Enforce Single Portfolio per User
  async getOrCreatePortfolio(userId: string) {
    const [existing] = await db
      .select()
      .from(schema.portfolios)
      .where(eq(schema.portfolios.userId, userId));

    if (existing) return existing;

    const [newPortfolio] = await db
      .insert(schema.portfolios)
      .values({ userId, name: "My Portfolio" })
      .returning();
    return newPortfolio;
  }

  async addTransaction(
    userId: string,
    data: {
      schemeCode: string;
      type: "BUY" | "SELL";
      units: number;
      pricePerUnit: number;
      date?: Date;
    },
  ) {
    const portfolio = await this.getOrCreatePortfolio(userId);
    const amount = data.units * data.pricePerUnit;

    return await db.transaction(async (tx) => {
      // 1. Log Transaction
      await tx.insert(schema.transactions).values({
        portfolioId: portfolio.id,
        schemeCode: data.schemeCode,
        type: data.type,
        units: data.units,
        pricePerUnit: data.pricePerUnit,
        amount: amount,
        date: data.date || new Date(),
      });

      // 2. Update/Create Holding
      const [existing] = await tx
        .select()
        .from(schema.holdings)
        .where(
          and(
            eq(schema.holdings.portfolioId, portfolio.id),
            eq(schema.holdings.schemeCode, data.schemeCode),
          ),
        );

      if (data.type === "BUY") {
        if (existing) {
          const totalUnits = existing.units + data.units;
          const totalCost =
            existing.units * (existing.averagePrice || 0) + amount;
          const newAvg = totalCost / totalUnits;

          await tx
            .update(schema.holdings)
            .set({ units: totalUnits, averagePrice: newAvg })
            .where(eq(schema.holdings.id, existing.id));
        } else {
          await tx.insert(schema.holdings).values({
            portfolioId: portfolio.id,
            schemeCode: data.schemeCode,
            units: data.units,
            averagePrice: data.pricePerUnit,
          });
        }
      } else if (data.type === "SELL") {
        if (!existing) {
          throw new Error("Cannot sell. Holding does not exist.");
        }
        if (existing.units < data.units) {
          throw new Error(
            `Insufficient units. You have ${existing.units}, trying to sell ${data.units}`,
          );
        }

        const remainingUnits = existing.units - data.units;
        if (remainingUnits === 0) {
          await tx
            .delete(schema.holdings)
            .where(eq(schema.holdings.id, existing.id));
        } else {
          await tx
            .update(schema.holdings)
            .set({ units: remainingUnits }) // Average price remains same on sell
            .where(eq(schema.holdings.id, existing.id));
        }
      }

      return { success: true };
    });
  }

  async getTransactions(userId: string, schemeCode?: string) {
    const portfolio = await this.getOrCreatePortfolio(userId);

    // Construct conditions
    const conditions = [eq(schema.transactions.portfolioId, portfolio.id)];
    if (schemeCode) {
      conditions.push(eq(schema.transactions.schemeCode, schemeCode));
    }

    const txs = await db
      .select({
        id: schema.transactions.id,
        schemeCode: schema.transactions.schemeCode,
        schemeName: schema.mutualFunds.schemeName,
        type: schema.transactions.type, // 'BUY' or 'SELL'
        units: schema.transactions.units,
        pricePerUnit: schema.transactions.pricePerUnit,
        amount: schema.transactions.amount,
        date: schema.transactions.date,
      })
      .from(schema.transactions)
      .leftJoin(
        schema.mutualFunds,
        eq(schema.transactions.schemeCode, schema.mutualFunds.schemeCode),
      )
      .where(and(...conditions))
      .orderBy(desc(schema.transactions.date));

    return txs;
  }

  async getPortfolioSummary(userId: string) {
    const portfolio = await this.getOrCreatePortfolio(userId);

    // Fetch Holdings with Current Value
    const holdingsData = await db
      .select({
        schemeCode: schema.holdings.schemeCode,
        schemeName: schema.mutualFunds.schemeName,
        units: schema.holdings.units,
        averagePrice: schema.holdings.averagePrice,
        latestNav: schema.latestNav.nav,
        latestNavDate: schema.latestNav.navDate,
      })
      .from(schema.holdings)
      .leftJoin(
        schema.mutualFunds,
        eq(schema.holdings.schemeCode, schema.mutualFunds.schemeCode),
      )
      .leftJoin(
        schema.latestNav,
        eq(schema.holdings.schemeCode, schema.latestNav.schemeCode),
      )
      .where(eq(schema.holdings.portfolioId, portfolio.id));

    let totalInvested = 0;
    let currentValue = 0;

    const holdings = holdingsData.map((h) => {
      const invested = h.units * (h.averagePrice || 0);
      const current = h.units * (h.latestNav || 0);
      totalInvested += invested;
      currentValue += current;

      return {
        ...h,
        investedValue: invested,
        currentValue: current,
        absoluteReturn: current - invested,
        returnPercentage:
          invested > 0 ? ((current - invested) / invested) * 100 : 0,
      };
    });

    // Calculate XIRR
    // Fetch ALL transactions for this portfolio
    const allTransactions = await db
      .select()
      .from(schema.transactions)
      .where(eq(schema.transactions.portfolioId, portfolio.id));

    const xirrValue = calculateXirr(
      allTransactions.map((t) => ({ amount: t.amount, date: t.date })),
      currentValue,
    );

    return {
      portfolio,
      summary: {
        totalInvested,
        currentValue,
        absoluteReturn: currentValue - totalInvested,
        returnPercentage:
          totalInvested > 0
            ? ((currentValue - totalInvested) / totalInvested) * 100
            : 0,
        xirr: xirrValue,
      },
      holdings,
    };
  }
}
