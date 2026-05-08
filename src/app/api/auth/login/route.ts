import { NextRequest, NextResponse } from "next/server";
import { mockDb } from "@/lib/data";
import { createSession } from "@/lib/session";
import { User } from "@/lib/types";

function stripPassword(user: User): Omit<User, "password"> {
  const { password: _password, ...rest } = user;
  return rest;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // TODO: Add Zod validation when integrating real backend
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const foundUser = mockDb.getUserByEmail(email);

    if (!foundUser || foundUser.password !== password) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    await createSession(foundUser);

    const userSpaces = mockDb.getSpacesByUserId(foundUser.id);

    return NextResponse.json({
      user: stripPassword(foundUser),
      defaultSpaceId: userSpaces[0]?.id ?? null,
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
