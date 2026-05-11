import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { ledgerItems, spaceMembers } from "@/db/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";

// GET /api/ledger-items?spaceId=X&from=YYYY-MM-DD&to=YYYY-MM-DD&limit=500&offset=0
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const spaceId = searchParams.get("spaceId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const limit = parseInt(searchParams.get("limit") || "500", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

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

    // Build where conditions
    const conditions = [eq(ledgerItems.spaceId, spaceId)];
    if (from) conditions.push(gte(ledgerItems.date, from));
    if (to) conditions.push(lte(ledgerItems.date, to));

    // Get total count
    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(ledgerItems)
      .where(and(...conditions));

    // Get items with updatedByName via raw SQL for the JOIN
    // Note: Using raw SQL because Drizzle's leftJoin with users table
    // is complex when users are managed by Better Auth
    const items = await db.execute(sql`
      SELECT 
        li.*,
        COALESCE(u.name, 'Unknown') as "updatedByName"
      FROM ledger_items li
      LEFT JOIN "user" u ON li.updated_by = u.id
      WHERE li.space_id = ${spaceId}
      ${from ? sql`AND li.date >= ${from}` : sql``}
      ${to ? sql`AND li.date <= ${to}` : sql``}
      ORDER BY li.sort_order ASC
      LIMIT ${limit}
      OFFSET ${offset}
    `);

    return NextResponse.json({
      items: items.rows.map((row: any) => ({
        id: row.id,
        spaceId: row.space_id,
        amount: parseFloat(row.amount),
        currency: row.currency,
        description: row.description,
        category: row.category,
        date: row.date,
        type: row.type,
        groupId: row.group_id,
        sortOrder: row.sort_order,
        version: row.version,
        createdBy: row.created_by,
        updatedBy: row.updated_by,
        updatedByName: row.updatedByName,
        createdAt: row.created_at?.toISOString?.() || row.created_at,
        updatedAt: row.updated_at?.toISOString?.() || row.updated_at,
      })),
      pagination: {
        totalCount: parseInt(countResult.count as unknown as string, 10),
        hasMore: offset + limit < parseInt(countResult.count as unknown as string, 10),
        nextOffset: offset + limit,
      },
    });
  } catch (error) {
    console.error("GET /api/ledger-items failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/ledger-items
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
      date,
      type = "default",
      groupId,
      currency = "MXN",
    } = body;

    if (!spaceId || amount === undefined || !description || !category || !date) {
      return NextResponse.json(
        { error: "spaceId, amount, description, category, and date are required" },
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

    // Auto-increment sort_order
    const [maxSort] = await db
      .select({ max: sql<number>`COALESCE(MAX(sort_order), -1)` })
      .from(ledgerItems)
      .where(eq(ledgerItems.spaceId, spaceId));

    const sortOrder = (maxSort?.max ?? -1) + 1;

    const [inserted] = await db
      .insert(ledgerItems)
      .values({
        spaceId,
        amount: String(amount),
        currency,
        description,
        category,
        date,
        type,
        groupId: groupId || null,
        sortOrder,
        version: 1,
        createdBy: session.user.id,
        updatedBy: session.user.id,
      })
      .returning();

    return NextResponse.json({ item: inserted }, { status: 201 });
  } catch (error) {
    console.error("POST /api/ledger-items failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
