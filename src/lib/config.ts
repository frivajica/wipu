// Feature flag for dual-mode transition.
// When false, API routes can fall back to mockDb responses if the database is unavailable.
export const USE_REAL_BACKEND = process.env.USE_REAL_BACKEND === "true";

// Database URL is required when USE_REAL_BACKEND is true.
export const DATABASE_URL = process.env.DATABASE_URL || "";

// Better Auth configuration.
export const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET || "";
export const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL || "http://localhost:3000";

// Quick validation helper for server startup.
export function assertBackendConfig() {
  if (USE_REAL_BACKEND) {
    if (!DATABASE_URL) {
      throw new Error("DATABASE_URL is required when USE_REAL_BACKEND=true");
    }
    if (!BETTER_AUTH_SECRET || BETTER_AUTH_SECRET.length < 32) {
      throw new Error(
        "BETTER_AUTH_SECRET must be at least 32 characters when USE_REAL_BACKEND=true"
      );
    }
  }
}
