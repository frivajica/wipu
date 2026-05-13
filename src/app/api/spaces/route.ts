import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { spaces, spaceMembers, user } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { generateInviteCode } from "@/lib/id-utils";
import { getInitials } from "@/lib/id-utils";

// GET /api/spaces - List all spaces for authenticated user with member data
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Get all spaces where the current user is a member
    const userSpaces = await db
      .select({
        space: spaces,
        role: spaceMembers.role,
      })
      .from(spaces)
      .innerJoin(spaceMembers, eq(spaces.id, spaceMembers.spaceId))
      .where(eq(spaceMembers.userId, session.user.id));

    const spaceIds = userSpaces.map(({ space }) => space.id);

    // 2. Batch-fetch all members + user info for those spaces (single query)
    const membersRows =
      spaceIds.length > 0
        ? await db
            .select({
              spaceId: spaceMembers.spaceId,
              userId: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
            })
            .from(spaceMembers)
            .innerJoin(user, eq(spaceMembers.userId, user.id))
            .where(inArray(spaceMembers.spaceId, spaceIds))
        : [];

    // Group members by spaceId in JS
    const membersBySpace = new Map<string, typeof membersRows>();
    for (const row of membersRows) {
      const list = membersBySpace.get(row.spaceId) ?? [];
      list.push(row);
      membersBySpace.set(row.spaceId, list);
    }

    return NextResponse.json({
      spaces: userSpaces.map(({ space, role }) => {
        const members = membersBySpace.get(space.id) ?? [];
        return {
          ...space,
          role,
          isOwnedByUser: space.ownerId === session.user.id,
          members: members.map((m) => m.userId),
          membersData: members.map((m) => ({
            id: m.userId,
            name: m.name ?? m.email.split("@")[0],
            email: m.email,
            initials: getInitials(m.name ?? m.email),
            avatarUrl: m.image ?? null,
          })),
        };
      }),
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
    const { name, isDefault = false } = body;

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
        isDefault,
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
