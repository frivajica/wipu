import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { spaceMembers } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

// GET /api/balances?spaceId=X&periodType=monthly
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const spaceId = searchParams.get("spaceId");
    const periodType = searchParams.get("periodType") || "monthly";

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

    // Get balances using SQL function
    const balancesResult = await db.execute(sql`
      SELECT * FROM get_space_balances(${spaceId})
    `);
    const balances = balancesResult.rows[0];

    // Get period stats for the last 12 months
    const now = new Date();
    const from = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const periodsResult = await db.execute(sql`
      SELECT * FROM get_period_stats(
        ${spaceId},
        ${from.toISOString().split("T")[0]},
        ${to.toISOString().split("T")[0]},
        ${periodType}
      )
    `);

    return NextResponse.json({
      totalBalance: parseFloat((balances as any)?.total_balance) || 0,
      totalDebt: parseFloat((balances as any)?.total_debt) || 0,
      realBalance: parseFloat((balances as any)?.real_balance) || 0,
      periods: periodsResult.rows.map((row: any) => ({
        label: row.period_key,
        balance: parseFloat(row.period_balance) || 0,
        debt: parseFloat(row.period_debt) || 0,
        runningBalance: parseFloat(row.running_balance) || 0,
        runningDebt: 0, // Calculated client-side if needed
      })),
    });
  } catch (error) {
    console.error("GET /api/balances failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
