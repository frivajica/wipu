import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { spaces, spaceMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { generateInviteCode } from "@/lib/id-utils";

// GET /api/spaces - List all spaces for authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userSpaces = await db
      .select({
        space: spaces,
        role: spaceMembers.role,
      })
      .from(spaces)
      .innerJoin(spaceMembers, eq(spaces.id, spaceMembers.spaceId))
      .where(eq(spaceMembers.userId, session.user.id));

    return NextResponse.json({
      spaces: userSpaces.map(({ space, role }) => ({
        ...space,
        members: [], // Populated separately if needed
        role,
      })),
    });
  } catch (error) {
    console.error("GET /api/spaces failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/spaces - Create a new space
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, isPersonal = false } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Create space
    const [space] = await db
      .insert(spaces)
      .values({
        name,
        ownerId: session.user.id,
        inviteCode: generateInviteCode(),
        isPersonal,
      })
      .returning();

    // Add creator as owner member
    await db.insert(spaceMembers).values({
      spaceId: space.id,
      userId: session.user.id,
      role: "owner",
    });

    return NextResponse.json({ space });
  } catch (error) {
    console.error("POST /api/spaces failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
