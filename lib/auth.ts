import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

if (process.env.NODE_ENV === "production") {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === "fallback_secret_key") {
    console.warn("\x1b[33m%s\x1b[0m", "SECURITY WARNING: process.env.JWT_SECRET is not configured or uses insecure default in production! Session hijacking is possible.");
  }
  if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET === "fallback_refresh_secret_key") {
    console.warn("\x1b[33m%s\x1b[0m", "SECURITY WARNING: process.env.JWT_REFRESH_SECRET is not configured or uses insecure default in production! Refresh token forge is possible.");
  }
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret_key");
const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret_key");


export async function signAccessToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(JWT_SECRET);
}

export async function signRefreshToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_REFRESH_SECRET);
}

export interface SessionPayload {
  userId: string;
  username: string;
  role: string;
}

export async function verifyAccessToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET);
    return payload as unknown as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Verification helper for route handlers to enforce Authentication and Authorization
export async function getSession(req?: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  if (!token) {
    return null;
  }
  return await verifyAccessToken(token);
}

export function authorizeRole(session: any, allowedRoles: string[]) {
  if (!session || !session.role) return false;
  const userRole = session.role.toUpperCase();
  const normalizedAllowed = allowedRoles.map(r => r.toUpperCase());
  return normalizedAllowed.includes(userRole) || userRole === "ADMIN";
}
