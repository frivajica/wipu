import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const spaceId = searchParams.get("spaceId");
  const periodType = searchParams.get("periodType") || "monthly";

  if (!spaceId) {
    return NextResponse.json(
      { error: "spaceId is required" },
      { status: 400 }
    );
  }

  const balances = mockDb.getBalances(spaceId, periodType);
  return NextResponse.json(balances);
}
