import { Elysia, t } from "elysia";
import { PortfolioService } from "../services/portfolio.service";
import { lucia } from "../auth/lucia";

const portfolioService = new PortfolioService();

// Middleware to get user
const userMiddleware = async ({ request, set }: any) => {
  const authorizationHeader = request.headers.get("Authorization");
  const sessionId = lucia.readBearerToken(authorizationHeader ?? "");
  if (!sessionId) {
    set.status = 401;
    throw new Error("Unauthorized");
  }
  const { user } = await lucia.validateSession(sessionId);
  if (!user) {
    set.status = 401;
    throw new Error("Unauthorized");
  }
  return { user };
};

export const portfolioController = new Elysia({ prefix: "/portfolios" })
  .derive(userMiddleware)
  // GET /portfolios -> Now returns the Single Portfolio Summary directly
  .get("/", async ({ user }) => {
    return await portfolioService.getPortfolioSummary(user.id);
  })
  // POST /portfolios/transactions -> Add a transaction (Buy/Sell)
  .post(
    "/transactions",
    async ({ user, body, set }) => {
      try {
        return await portfolioService.addTransaction(user.id, {
          schemeCode: body.schemeCode,
          type: body.type as "BUY" | "SELL",
          units: body.units,
          pricePerUnit: body.pricePerUnit,
          date: body.date ? new Date(body.date) : new Date(),
        });
      } catch (e) {
        set.status = 400;
        return { error: (e as Error).message, stack: (e as Error).stack };
      }
    },
    {
      body: t.Object({
        schemeCode: t.String(),
        type: t.String(), // 'BUY'
        units: t.Number(),
        pricePerUnit: t.Number(),
        date: t.Optional(t.String()), // ISO Date String
      }),
    },
  )
  // GET /portfolios/transactions/:schemeCode
  .get("/transactions/:schemeCode", async ({ user, params }) => {
    return await portfolioService.getTransactions(user.id, params.schemeCode);
  });
