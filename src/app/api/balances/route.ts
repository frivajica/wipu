import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { spaceMembers } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { DateTime } from "luxon";

interface SpaceBalanceRow {
  total_balance: string;
  total_debt: string;
  real_balance: string;
}

interface PeriodStatRow {
  period_key: string;
  display_label: string;
  period_balance: string;
  period_debt: string;
  running_balance: string;
  running_debt: string;
}

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
    const cutoffDate = searchParams.get("cutoffDate");
    const balancesResult = await db.execute(sql`
      SELECT * FROM get_space_balances(${spaceId}, ${cutoffDate ?? null})
    `);
    const balances = balancesResult.rows[0] as unknown as SpaceBalanceRow | undefined;

    // Get period stats for the last 12 months
    const now = DateTime.now();
    const from = now.minus({ years: 1 }).startOf("month").toFormat("yyyy-MM-dd");
    const to = now.endOf("month").toFormat("yyyy-MM-dd");

    const periodsResult = await db.execute(sql`
      SELECT * FROM get_period_stats(
        ${spaceId},
        ${from},
        ${to},
        ${periodType}
      )
    `);

    return NextResponse.json({
      totalBalance: parseFloat(balances?.total_balance ?? "0") || 0,
      totalDebt: parseFloat(balances?.total_debt ?? "0") || 0,
      realBalance: parseFloat(balances?.real_balance ?? "0") || 0,
      periods: periodsResult.rows.map((row: unknown) => {
        const r = row as PeriodStatRow;
        return {
          label: r.period_key,
          displayLabel: r.display_label,
          balance: parseFloat(r.period_balance) || 0,
          debt: parseFloat(r.period_debt) || 0,
          runningBalance: parseFloat(r.running_balance) || 0,
          runningDebt: parseFloat(r.running_debt) || 0,
        };
      }),
    });
  } catch (error) {
    console.error("GET /api/balances failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
