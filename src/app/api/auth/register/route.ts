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
    const { name, email, password } = body;

    // TODO: Add Zod validation when integrating real backend
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const existingUser = mockDb.getUserByEmail(email);

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const newUser = mockDb.createUser({
      email,
      name,
      password,
      avatarUrl: null,
    });

    const personalSpace = mockDb.createSpace({
      name: "Personal",
      ownerId: newUser.id,
      members: [newUser.id],
      maxMembers: 8,
      isPersonal: true,
    });

    await createSession(newUser);

    return NextResponse.json({
      user: stripPassword(newUser),
      space: personalSpace,
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
