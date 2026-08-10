import { createAuthClient } from "better-auth/react";

// In the browser, call the same origin the page was served from, so LAN-IP
// access (192.168.1.2:3000) doesn't get CORS-blocked by a localhost base URL.
const baseURL =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const authClient = createAuthClient({ baseURL });

export type AuthClient = typeof authClient;
