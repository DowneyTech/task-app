import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { prisma } from "../db";
import { authMiddleware } from "../middleware/auth";

export const authRoutes = new Hono();

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const jwtSecretRaw = process.env.JWT_SECRET;
if (!jwtSecretRaw) throw new Error("JWT_SECRET 環境変数が設定されていません");
const JWT_SECRET = new TextEncoder().encode(jwtSecretRaw);

const makeToken = async (userId: string, email: string): Promise<string> => {
  return new SignJWT({ sub: userId, email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(JWT_SECRET);
};

authRoutes.post("/register", zValidator("json", registerSchema), async (c) => {
  const { email, name, password } = c.req.valid("json");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return c.json({ error: "Email already in use" }, 409);

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, name, password: hashed },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  const token = await makeToken(user.id, user.email);
  return c.json(
    { token, user: { ...user, createdAt: user.createdAt.toISOString() } },
    201
  );
});

authRoutes.post("/login", zValidator("json", loginSchema), async (c) => {
  const { email, password } = c.req.valid("json");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return c.json({ error: "Invalid credentials" }, 401);

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return c.json({ error: "Invalid credentials" }, 401);

  const token = await makeToken(user.id, user.email);
  return c.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
    },
  });
});

authRoutes.get("/me", authMiddleware, async (c) => {
  const userId = c.get("userId");
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, createdAt: true },
  });
  if (!user) return c.json({ error: "Not found" }, 404);
  return c.json({ ...user, createdAt: user.createdAt.toISOString() });
});
