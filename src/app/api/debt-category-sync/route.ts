import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { spaceMembers, ledgerItems } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// POST /api/debt-category-sync - Bulk sync category for debt items
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { spaceId, description, category } = body;

    if (!spaceId || !description || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check membership
    const membership = await db
      .select()
      .from(spaceMembers)
      .where(
        and(
          eq(spaceMembers.spaceId, spaceId),
          eq(spaceMembers.userId, session.user.id)
        )
      )
      .limit(1);

    if (!membership.length) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update all matching debt items
    await db
      .update(ledgerItems)
      .set({ category, updatedBy: session.user.id })
      .where(
        and(
          eq(ledgerItems.spaceId, spaceId),
          eq(ledgerItems.type, "debt"),
          eq(ledgerItems.description, description)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/debt-category-sync failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
