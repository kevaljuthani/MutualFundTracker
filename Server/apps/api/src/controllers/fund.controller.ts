import { Elysia, t } from "elysia";
import { FundService } from "../services/fund.service";

const fundService = new FundService();

export const fundController = new Elysia({ prefix: "/funds" })
  .get(
    "/",
    async ({ query }) => {
      const q = query.q as string;
      if (!q) return { data: [] };
      const data = await fundService.searchFunds(q);
      return { data };
    },
    {
      query: t.Object({
        q: t.Optional(t.String()),
      }),
    },
  )
  .get(
    "/featured",
    async ({ query }) => {
      const limit = Number(query.limit) || 10;
      const data = await fundService.getFeaturedFunds(limit);
      return { data };
    },
    {
      query: t.Object({
        limit: t.Optional(t.Numeric()),
      }),
    },
  )
  .get(
    "/all",
    async ({ query }) => {
      const limit = Number(query.limit) || 20;
      const offset = Number(query.offset) || 0;
      const data = await fundService.getAllFunds(limit, offset);
      return { data };
    },
    {
      query: t.Object({
        limit: t.Optional(t.Numeric()),
        offset: t.Optional(t.Numeric()),
      }),
    },
  )
  .get("/:code", async ({ params, set }) => {
    const fund = await fundService.getFundDetails(params.code);
    if (!fund) {
      set.status = 404;
      return { error: "Fund not found" };
    }
    return { data: fund };
  })
  .get(
    "/:code/history",
    async ({ params, query }) => {
      const period = (query.period as any) || "1M";
      const data = await fundService.getHistory(params.code, period);
      return { data };
    },
    {
      query: t.Object({
        period: t.Optional(t.String()),
      }),
    },
  );
