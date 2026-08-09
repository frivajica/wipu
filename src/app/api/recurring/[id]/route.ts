import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { recurringItems, spaceMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";

async function getRuleWithMembership(id: string, userId: string) {
  const [rule] = await db
    .select()
    .from(recurringItems)
    .where(eq(recurringItems.id, id))
    .limit(1);

  if (!rule) {
    return { error: { status: 404 } as const, rule: null };
  }

  const membership = await db
    .select()
    .from(spaceMembers)
    .where(
      and(
        eq(spaceMembers.spaceId, rule.spaceId),
        eq(spaceMembers.userId, userId)
      )
    )
    .limit(1);

  if (!membership.length) {
    return { error: { status: 403 } as const, rule: null };
  }

  return { error: null, rule };
}

// PUT /api/recurring/[id] - Update a recurring rule
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
    const {
      amount,
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
    } = body;

    const { error, rule } = await getRuleWithMembership(id, session.user.id);
    if (error || !rule) {
      return NextResponse.json({ error: "Not found" }, { status: error?.status ?? 404 });
    }

    const [updated] = await db
      .update(recurringItems)
      .set({
        amount: amount !== undefined ? amount.toString() : rule.amount.toString(),
        description: description ?? rule.description,
        category: category ?? rule.category,
        type: type ?? rule.type,
        groupId: groupId !== undefined ? groupId : rule.groupId,
        frequencyUnit: frequencyUnit ?? rule.frequencyUnit,
        intervalCount: intervalCount ?? rule.intervalCount,
        byDay: byDay !== undefined ? byDay : rule.byDay,
        byMonthDay: byMonthDay !== undefined ? byMonthDay : rule.byMonthDay,
        startDate: startDate ?? rule.startDate,
        endDate: endDate !== undefined ? endDate : rule.endDate,
        count: count !== undefined ? count : rule.count,
        updatedAt: new Date(),
      })
      .where(eq(recurringItems.id, id))
      .returning();

    return NextResponse.json({ rule: updated });
  } catch (error) {
    console.error("PUT /api/recurring/[id] failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/recurring/[id] - Toggle rule active state
export async function PATCH(
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
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json({ error: "isActive is required" }, { status: 400 });
    }

    const { error, rule } = await getRuleWithMembership(id, session.user.id);
    if (error || !rule) {
      return NextResponse.json({ error: "Not found" }, { status: error?.status ?? 404 });
    }

    const [updated] = await db
      .update(recurringItems)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(recurringItems.id, id))
      .returning();

    return NextResponse.json({ rule: updated });
  } catch (error) {
    console.error("PATCH /api/recurring/[id] failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/recurring/[id] - Delete a recurring rule (instances cascade)
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

    const { error, rule } = await getRuleWithMembership(id, session.user.id);
    if (error || !rule) {
      return NextResponse.json({ error: "Not found" }, { status: error?.status ?? 404 });
    }

    await db.delete(recurringItems).where(eq(recurringItems.id, id));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/recurring/[id] failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}