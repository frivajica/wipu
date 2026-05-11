import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { ledgerItems, spaceMembers, recurringItems } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

// GET /api/export?spaceId=X&from=YYYY-MM-DD&to=YYYY-MM-DD
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

    // Fetch items
    const conditions = [eq(ledgerItems.spaceId, spaceId)];
    if (from) conditions.push(gte(ledgerItems.date, from));
    if (to) conditions.push(lte(ledgerItems.date, to));

    const items = await db
      .select()
      .from(ledgerItems)
      .where(and(...conditions))
      .orderBy(ledgerItems.date);

    // Generate CSV
    const headers = ["Date", "Description", "Category", "Amount", "Currency", "Type"];
    const rows = items.map((item) => [
      item.date,
      `"${item.description.replace(/"/g, '""')}"`,
      `"${item.category.replace(/"/g, '""')}"`,
      item.amount,
      item.currency,
      item.type,
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="ledger-export-${spaceId}.csv"`,
      },
    });
  } catch (error) {
    console.error("GET /api/export failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
