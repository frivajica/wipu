import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { recurringItems, recurringInstances, spaceMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET /api/recurring?spaceId=X - List recurring rules
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

    const rules = await db
      .select()
      .from(recurringItems)
      .where(eq(recurringItems.spaceId, spaceId));

    return NextResponse.json({ rules });
  } catch (error) {
    console.error("GET /api/recurring failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/recurring - Create recurring rule
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
      type = "default",
      groupId,
      frequencyUnit,
      intervalCount = 1,
      byDay,
      byMonthDay,
      startDate,
      endDate,
      count,
    } = body;

    if (!spaceId || !amount || !description || !category || !startDate || !frequencyUnit) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

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

    // Calculate next_occurrence based on rule
    const nextOccurrence = startDate; // Simplified - should calculate based on rule

    const [rule] = await db
      .insert(recurringItems)
      .values({
        spaceId,
        amount: amount.toString(),
        description,
        category,
        type,
        groupId,
        frequencyUnit,
        intervalCount,
        byDay,
        byMonthDay,
        startDate,
        endDate,
        count,
        nextOccurrence,
        createdBy: session.user.id,
      })
      .returning();

    // Generate initial instances (simplified: just create first occurrence)
    await db.insert(recurringInstances).values({
      recurringItemId: rule.id,
      occurrenceDate: startDate,
    });

    return NextResponse.json({ rule });
  } catch (error) {
    console.error("POST /api/recurring failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
