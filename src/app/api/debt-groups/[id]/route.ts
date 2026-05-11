import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { debtGroups, spaceMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// PUT /api/debt-groups/[id] - Update debt group
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
    const { name, color } = body;

    // Get group to check space
    const [group] = await db
      .select()
      .from(debtGroups)
      .where(eq(debtGroups.id, id))
      .limit(1);

    if (!group) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check membership
    const membership = await db
      .select()
      .from(spaceMembers)
      .where(
        and(
          eq(spaceMembers.spaceId, group.spaceId),
          eq(spaceMembers.userId, session.user.id)
        )
      )
      .limit(1);

    if (!membership.length) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [updated] = await db
      .update(debtGroups)
      .set({ name, color })
      .where(eq(debtGroups.id, id))
      .returning();

    return NextResponse.json({ group: updated });
  } catch (error) {
    console.error("PUT /api/debt-groups/[id] failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/debt-groups/[id] - Delete debt group
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

    // Get group to check space
    const [group] = await db
      .select()
      .from(debtGroups)
      .where(eq(debtGroups.id, id))
      .limit(1);

    if (!group) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check membership
    const membership = await db
      .select()
      .from(spaceMembers)
      .where(
        and(
          eq(spaceMembers.spaceId, group.spaceId),
          eq(spaceMembers.userId, session.user.id)
        )
      )
      .limit(1);

    if (!membership.length) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.delete(debtGroups).where(eq(debtGroups.id, id));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/debt-groups/[id] failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
