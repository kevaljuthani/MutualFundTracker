import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { fundController } from "./controllers/fund.controller";
import { authController } from "./controllers/auth.controller";
import { portfolioController } from "./controllers/portfolio.controller";

const app = new Elysia()
  .use(cors())
  .use(fundController)
  .use(authController)
  .use(portfolioController)
  .get("/", () => "Mutual Fund Tracker API")
  .listen(9001);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

export type App = typeof app;
