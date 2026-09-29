import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { Role, SessionUser, UserStatus } from "./types";

const COOKIE = "gs_session";

function secret() {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET ?? "grabstudent-dev-secret-change-in-production-please",
  );
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      id: String(payload.sub),
      name: String(payload.name),
      email: String(payload.email),
      role: payload.role as Role,
      status: payload.status as UserStatus,
    };
  } catch {
    return null;
  }
}

export function requireRole(user: SessionUser | null, roles: Role[]) {
  if (!user) {
    const err = new Error("Unauthorized");
    (err as Error & { status: number }).status = 401;
    throw err;
  }
  if (!roles.includes(user.role)) {
    const err = new Error("Forbidden");
    (err as Error & { status: number }).status = 403;
    throw err;
  }
  return user;
}

export function requireApproved(user: SessionUser) {
  if (user.role !== "admin" && user.status !== "approved") {
    const err = new Error("Account pending approval");
    (err as Error & { status: number }).status = 403;
    throw err;
  }
  return user;
}
