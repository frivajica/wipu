import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { ledgerItems, spaceMembers } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

// POST /api/ledger-items - Create item
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      spaceId,
      amount,
      description,
      category,
      date,
      type = "default",
      groupId = null,
    } = body;

    if (!spaceId || !amount || !description || !category || !date) {
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

    // Get max sort_order for this space
    const [maxSort] = await db
      .select({ max: sql<number>`COALESCE(MAX(${ledgerItems.sortOrder}), -1)` })
      .from(ledgerItems)
      .where(eq(ledgerItems.spaceId, spaceId));

    const [item] = await db
      .insert(ledgerItems)
      .values({
        spaceId,
        amount: amount.toString(),
        description,
        category,
        date,
        type,
        groupId,
        sortOrder: (maxSort?.max ?? -1) + 1,
        createdBy: session.user.id,
        updatedBy: session.user.id,
      })
      .returning();

    return NextResponse.json({ item });
  } catch (error) {
    console.error("POST /api/ledger-items failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
