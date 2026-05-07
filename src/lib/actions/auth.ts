"use server";

import { mockDb } from "@/lib/data";
import { User } from "@/lib/types";
import { createSession, deleteSession } from "@/lib/session";

function stripPassword(user: User): Omit<User, "password"> {
  const { password: _password, ...rest } = user;
  return rest;
}

export async function loginAction(email: string, password: string) {
  const foundUser = mockDb.getUserByEmail(email);

  if (!foundUser || foundUser.password !== password) {
    throw new Error("Invalid email or password");
  }

  await createSession(foundUser);

  const userSpaces = mockDb.getSpacesByUserId(foundUser.id);

  return {
    user: stripPassword(foundUser),
    defaultSpaceId: userSpaces[0]?.id ?? null,
  };
}

export async function registerAction(
  name: string,
  email: string,
  password: string
) {
  const existingUser = mockDb.getUserByEmail(email);

  if (existingUser) {
    throw new Error("Email already registered");
  }

  const newUser = mockDb.createUser({ email, name, password, avatarUrl: null });
  const personalSpace = mockDb.createSpace({
    name: "Personal",
    ownerId: newUser.id,
    members: [newUser.id],
    maxMembers: 8,
    isPersonal: true,
  });

  await createSession(newUser);

  return { user: stripPassword(newUser), space: personalSpace };
}

export async function logoutAction() {
  await deleteSession();
}
