import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./db";
import type { UserRole, UserStatus } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-me";
const TOKEN_NAME = "bicak_auth_token";
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7;

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  phoneVerified: boolean;
}

export interface TokenPayload extends AuthUser {
  iat?: number;
  exp?: number;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function findUserByLoginIdentifier(identifier: string) {
  const trimmed = identifier.trim();
  if (!trimmed) return null;

  if (trimmed.includes("@")) {
    const byEmail = await prisma.user.findUnique({ where: { email: trimmed } });
    if (byEmail) return byEmail;
    return prisma.user.findUnique({ where: { email: trimmed.toLowerCase() } });
  }

  const byUsername = await prisma.user.findUnique({
    where: { username: trimmed.toLowerCase() },
  });
  if (byUsername) return byUsername;

  return prisma.user.findUnique({ where: { email: trimmed } });
}

export function signToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: TOKEN_MAX_AGE });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TOKEN_MAX_AGE,
    path: "/",
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_NAME);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      phoneVerified: true,
    },
  });

  if (!user || user.status === "BLOCKED" || user.status === "INACTIVE") {
    return null;
  }

  return user;
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  if (!user.phoneVerified) throw new Error("PHONE_NOT_VERIFIED");
  return user;
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  if (user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return user;
}

export async function logAdminAction(
  adminId: string,
  action: string,
  details?: string,
  ipAddress?: string
) {
  await prisma.adminLog.create({
    data: { adminId, action, details, ipAddress },
  });
}
