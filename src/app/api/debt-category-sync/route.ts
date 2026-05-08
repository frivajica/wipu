import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/data";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { spaceId, description, category } = body;

  if (!spaceId || !description || !category) {
    return NextResponse.json(
      { error: "spaceId, description, and category are required" },
      { status: 400 }
    );
  }

  const count = mockDb.updateLedgerItemsByDescription(spaceId, description, {
    category,
  });

  return NextResponse.json({ updated: count });
}
