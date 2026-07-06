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

const jwtSecretRaw = process.env.JWT_SECRET;
if (!jwtSecretRaw) throw new Error("JWT_SECRET 環境変数が設定されていません");
const JWT_SECRET = new TextEncoder().encode(jwtSecretRaw);

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
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
