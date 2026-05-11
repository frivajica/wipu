import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { ledgerItems, spaceMembers, categories } from "@/db/schema";
import { eq, and, sql, ilike } from "drizzle-orm";

// GET /api/autocomplete?field=description|category&q=query&spaceId=X
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const field = searchParams.get("field");
    const q = searchParams.get("q");
    const spaceId = searchParams.get("spaceId");

    if (!field || !q) {
      return NextResponse.json(
        { error: "field and q are required" },
        { status: 400 }
      );
    }

    // If spaceId provided, check membership
    if (spaceId) {
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
    }

    let suggestions: string[] = [];

    if (field === "description") {
      // Use trigram index for fast ILIKE search
      const items = await db
        .selectDistinct({ description: ledgerItems.description })
        .from(ledgerItems)
        .where(
          spaceId
            ? and(
                eq(ledgerItems.spaceId, spaceId),
                sql`${ledgerItems.description} ILIKE ${`%${q}%`}`
              )
            : sql`${ledgerItems.description} ILIKE ${`%${q}%`}`
        )
        .limit(10);

      suggestions = items.map((item) => item.description);
    } else if (field === "category") {
      const cats = await db
        .select({ name: categories.name })
        .from(categories)
        .where(
          spaceId
            ? and(
                eq(categories.spaceId, spaceId),
                sql`${categories.name} ILIKE ${`%${q}%`}`
              )
            : sql`${categories.name} ILIKE ${`%${q}%`}`
        )
        .limit(10);

      suggestions = cats.map((cat) => cat.name);
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("GET /api/autocomplete failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
