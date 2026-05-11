import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { ledgerItems, spaceMembers } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

// POST /api/ledger-items/reorder - Reorder items
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { spaceId, itemIds, dateUpdates, updatedBy } = body;

    if (!spaceId || !itemIds || !Array.isArray(itemIds)) {
      return NextResponse.json(
        { error: "spaceId and itemIds are required" },
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

    // Apply date updates if provided
    if (dateUpdates) {
      for (const [itemId, dateValue] of Object.entries(dateUpdates)) {
        await db
          .update(ledgerItems)
          .set({
            date: dateValue as string,
            updatedBy: updatedBy || session.user.id,
            updatedAt: new Date(),
          })
          .where(eq(ledgerItems.id, itemId));
      }
    }

    // Reassign sort_order based on itemIds array order
    for (let i = 0; i < itemIds.length; i++) {
      await db
        .update(ledgerItems)
        .set({ sortOrder: i })
        .where(eq(ledgerItems.id, itemIds[i]));
    }

    // Return updated items
    const updatedItems = await db
      .select()
      .from(ledgerItems)
      .where(eq(ledgerItems.spaceId, spaceId))
      .orderBy(ledgerItems.sortOrder);

    return NextResponse.json({ items: updatedItems });
  } catch (error) {
    console.error("POST /api/ledger-items/reorder failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
