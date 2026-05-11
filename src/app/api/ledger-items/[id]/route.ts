import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { ledgerItems, spaceMembers } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

// PUT /api/ledger-items/[id] - Update item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { updates, version: expectedVersion } = body;

    // Get item to check space
    const [item] = await db
      .select()
      .from(ledgerItems)
      .where(eq(ledgerItems.id, id))
      .limit(1);

    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check membership
    const membership = await db
      .select()
      .from(spaceMembers)
      .where(
        and(
          eq(spaceMembers.spaceId, item.spaceId),
          eq(spaceMembers.userId, session.user.id)
        )
      )
      .limit(1);

    if (!membership.length) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Optimistic locking: check version if provided
    if (expectedVersion !== undefined && item.version !== expectedVersion) {
      return NextResponse.json(
        { error: "Conflict", currentItem: item },
        { status: 409 }
      );
    }

    const [updated] = await db
      .update(ledgerItems)
      .set({
        ...updates,
        updatedBy: session.user.id,
        version: sql`${ledgerItems.version} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(ledgerItems.id, id))
      .returning();

    return NextResponse.json({ item: updated });
  } catch (error) {
    console.error("PUT /api/ledger-items/[id] failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/ledger-items/[id] - Delete item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get item to check space
    const [item] = await db
      .select()
      .from(ledgerItems)
      .where(eq(ledgerItems.id, id))
      .limit(1);

    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check membership
    const membership = await db
      .select()
      .from(spaceMembers)
      .where(
        and(
          eq(spaceMembers.spaceId, item.spaceId),
          eq(spaceMembers.userId, session.user.id)
        )
      )
      .limit(1);

    if (!membership.length) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.delete(ledgerItems).where(eq(ledgerItems.id, id));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/ledger-items/[id] failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
