import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { spaces, spaceMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET /api/spaces/[id]/members - List space members
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

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

    const members = await db
      .select()
      .from(spaceMembers)
      .where(eq(spaceMembers.spaceId, id));

    return NextResponse.json({ members });
  } catch (error) {
    console.error("GET /api/spaces/[id]/members failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/spaces/[id]/members - Remove member (owner only)
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
    const body = await request.json();
    const { userId } = body;

    // Check if requester is owner
    const ownership = await db
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

    if (!ownership.length) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db
      .delete(spaceMembers)
      .where(
        and(
          eq(spaceMembers.spaceId, id),
          eq(spaceMembers.userId, userId)
        )
      );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/spaces/[id]/members failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
