import { cookies } from "next/headers";
import { User } from "./types";

const SESSION_COOKIE = "wipu_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  expiresAt: string;
}

export async function createSession(user: User) {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const payload: SessionPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    expiresAt: expiresAt.toISOString(),
  };

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, JSON.stringify(payload), {
    httpOnly: false, // Client reads it for Zustand hydration
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE)?.value;

  if (!cookie) return null;

  try {
    const session = JSON.parse(cookie) as SessionPayload;
    const expiresAt = new Date(session.expiresAt);

    if (expiresAt < new Date()) {
      cookieStore.delete(SESSION_COOKIE);
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
