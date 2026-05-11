import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { debtGroups, spaceMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET /api/debt-groups?spaceId=X - List debt groups for space
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const spaceId = searchParams.get("spaceId");

    if (!spaceId) {
      return NextResponse.json({ error: "spaceId is required" }, { status: 400 });
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

    const groups = await db
      .select()
      .from(debtGroups)
      .where(eq(debtGroups.spaceId, spaceId));

    return NextResponse.json({ groups });
  } catch (error) {
    console.error("GET /api/debt-groups failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/debt-groups - Create debt group
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { spaceId, name, color } = body;

    if (!spaceId || !name) {
      return NextResponse.json(
        { error: "spaceId and name are required" },
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

    const [group] = await db
      .insert(debtGroups)
      .values({
        spaceId,
        name,
        color: color || "#3b82f6",
        createdBy: session.user.id,
      })
      .returning();

    return NextResponse.json({ group });
  } catch (error) {
    console.error("POST /api/debt-groups failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
