import { NextResponse } from "next/server";

// GET /api/health — liveness probe for the container healthcheck
export async function GET() {
  return NextResponse.json({ status: "ok" });
}