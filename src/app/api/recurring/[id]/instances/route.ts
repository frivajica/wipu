import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { recurringInstances, recurringItems, spaceMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET /api/recurring/[id]/instances - List instances
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

    // Get rule to check space
    const [rule] = await db
      .select()
      .from(recurringItems)
      .where(eq(recurringItems.id, id))
      .limit(1);

    if (!rule) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const membership = await db
      .select()
      .from(spaceMembers)
      .where(
        and(
          eq(spaceMembers.spaceId, rule.spaceId),
          eq(spaceMembers.userId, session.user.id)
        )
      )
      .limit(1);

    if (!membership.length) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const instances = await db
      .select()
      .from(recurringInstances)
      .where(eq(recurringInstances.recurringItemId, id))
      .orderBy(recurringInstances.occurrenceDate);

    return NextResponse.json({ instances });
  } catch (error) {
    console.error("GET /api/recurring/[id]/instances failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/recurring/[id]/skip - Skip an instance
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
    const body = await request.json();
    const { instanceId } = body;

    if (!instanceId) {
      return NextResponse.json({ error: "instanceId is required" }, { status: 400 });
    }

    // Get rule to check space
    const [rule] = await db
      .select()
      .from(recurringItems)
      .where(eq(recurringItems.id, id))
      .limit(1);

    if (!rule) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const membership = await db
      .select()
      .from(spaceMembers)
      .where(
        and(
          eq(spaceMembers.spaceId, rule.spaceId),
          eq(spaceMembers.userId, session.user.id)
        )
      )
      .limit(1);

    if (!membership.length) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db
      .update(recurringInstances)
      .set({ skipped: true })
      .where(eq(recurringInstances.id, instanceId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/recurring/[id]/skip failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
