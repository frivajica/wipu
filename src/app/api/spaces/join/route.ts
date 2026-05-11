import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { spaces, spaceMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// POST /api/spaces/join - Join a space via invite code
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { inviteCode } = body;

    if (!inviteCode) {
      return NextResponse.json({ error: "Invite code is required" }, { status: 400 });
    }

    // Find space by invite code
    const [space] = await db
      .select()
      .from(spaces)
      .where(eq(spaces.inviteCode, inviteCode))
      .limit(1);

    if (!space) {
      return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
    }

    // Check if already a member
    const existing = await db
      .select()
      .from(spaceMembers)
      .where(
        and(
          eq(spaceMembers.spaceId, space.id),
          eq(spaceMembers.userId, session.user.id)
        )
      )
      .limit(1);

    if (existing.length) {
      return NextResponse.json({ error: "Already a member" }, { status: 409 });
    }

    // Check max members
    const memberCount = await db
      .select()
      .from(spaceMembers)
      .where(eq(spaceMembers.spaceId, space.id));

    if (memberCount.length >= (space.maxMembers ?? 15)) {
      return NextResponse.json({ error: "Space is full" }, { status: 403 });
    }

    await db.insert(spaceMembers).values({
      spaceId: space.id,
      userId: session.user.id,
      role: "member",
    });

    return NextResponse.json({ space });
  } catch (error) {
    console.error("POST /api/spaces/join failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
