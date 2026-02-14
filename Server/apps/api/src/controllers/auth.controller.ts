import { Elysia, t } from "elysia";
import { lucia } from "../auth/lucia";
import { db, schema } from "@mf-tracker/db";
import { eq } from "drizzle-orm";
import { generateId } from "lucia";
import { Argon2id } from "oslo/password";

export const authController = new Elysia({ prefix: "/auth" })
  .post(
    "/signup",
    async ({ body, set }) => {
      const { email, password, name } = body;

      try {
        // Check if user exists
        const existing = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.email, email))
          .limit(1);
        if (existing.length > 0) {
          set.status = 400;
          return { error: "User already exists" };
        }

        const passwordHash = await new Argon2id().hash(password);
        const userId = generateId(15);

        await db.insert(schema.users).values({
          id: userId,
          email,
          passwordHash,
          name,
          createdAt: new Date(),
        });

        const session = await lucia.createSession(userId, {});
        // In a real app we'd set a cookie, but for API we return the token/session ID
        return {
          token: session.id,
          user: { id: userId, email, name },
        };
      } catch (error) {
        console.error("Signup error:", error);
        set.status = 500;
        return { error: (error as Error).message || "Internal Server Error" };
      }
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
        name: t.String(),
      }),
    },
  )
  .post(
    "/login",
    async ({ body, set }) => {
      const { email, password } = body;

      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, email))
        .limit(1);
      if (!user) {
        set.status = 400;
        return { error: "Invalid credentials" };
      }

      const validPassword = await new Argon2id().verify(
        user.passwordHash,
        password,
      );
      if (!validPassword) {
        set.status = 400;
        return { error: "Invalid credentials" };
      }

      const session = await lucia.createSession(user.id, {});
      return {
        token: session.id,
        user: { id: user.id, email: user.email, name: user.name },
      };
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
    },
  )
  .get("/me", async ({ request, set }) => {
    const authorizationHeader = request.headers.get("Authorization");
    const sessionId = lucia.readBearerToken(authorizationHeader ?? "");

    if (!sessionId) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const { session, user } = await lucia.validateSession(sessionId);
    if (!session) {
      set.status = 401;
      return { error: "Unauthorized" };
    }
    return { user };
  });
