import { createMiddleware } from "hono/factory";
import { jwtVerify } from "jose";
import { prisma } from "../db";

interface JwtPayload {
  sub: string;
  email: string;
}

declare module "hono" {
  interface ContextVariableMap {
    userId: string;
    userEmail: string;
  }
}

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.slice(7);
  const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "secret");

  try {
    const { payload } = await jwtVerify(token, secret);
    const { sub, email } = payload as unknown as JwtPayload;

    const user = await prisma.user.findUnique({ where: { id: sub } });
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    c.set("userId", sub);
    c.set("userEmail", email);
    await next();
  } catch {
    return c.json({ error: "Unauthorized" }, 401);
  }
});
