import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { spaces, spaceMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// POST /api/spaces/[id]/leave - Leave a space
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if member
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
      return NextResponse.json({ error: "Not a member" }, { status: 403 });
    }

    const [targetSpace] = await db
      .select()
      .from(spaces)
      .where(eq(spaces.id, id))
      .limit(1);

    if (targetSpace?.isDefault) {
      return NextResponse.json(
        { error: "Cannot leave your default space" },
        { status: 403 }
      );
    }

    await db
      .delete(spaceMembers)
      .where(
        and(
          eq(spaceMembers.spaceId, id),
          eq(spaceMembers.userId, session.user.id)
        )
      );

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("POST /api/spaces/[id]/leave failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
