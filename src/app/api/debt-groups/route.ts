import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const spaceId = searchParams.get("spaceId");

  if (!spaceId) {
    return NextResponse.json(
      { error: "spaceId is required" },
      { status: 400 }
    );
  }

  const groups = mockDb.getDebtGroups(spaceId);
  return NextResponse.json({ groups });
}
