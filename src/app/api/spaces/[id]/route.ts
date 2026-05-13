import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { spaces, spaceMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// PUT /api/spaces/[id] - Update space
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
    const { name } = body;

    // Check membership
    const membership = await db
      .select()
      .from(spaceMembers)
      .where(
        and(
          eq(spaceMembers.spaceId, id),
          eq(spaceMembers.userId, session.user.id)
        )
      )
      .limit(1);

    if (!membership.length) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [updated] = await db
      .update(spaces)
      .set({ name })
      .where(eq(spaces.id, id))
      .returning();

    return NextResponse.json({ space: updated });
  } catch (error) {
    console.error("PUT /api/spaces/[id] failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/spaces/[id] - Delete space
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

    // Check if user is owner
    const membership = await db
      .select()
      .from(spaceMembers)
      .where(
        and(
          eq(spaceMembers.spaceId, id),
          eq(spaceMembers.userId, session.user.id),
          eq(spaceMembers.role, "owner")
        )
      )
      .limit(1);

    if (!membership.length) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [targetSpace] = await db
      .select()
      .from(spaces)
      .where(eq(spaces.id, id))
      .limit(1);

    if (targetSpace?.isDefault) {
      return NextResponse.json(
        { error: "Cannot delete your default space" },
        { status: 403 }
      );
    }

    await db.delete(spaces).where(eq(spaces.id, id));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/spaces/[id] failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
