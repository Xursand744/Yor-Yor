import type { DefaultSession } from "next-auth";

export type UserRoleValue = "admin" | "manager" | "client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRoleValue;
      venueId: string | null;
      phone: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRoleValue;
    venueId: string | null;
    phone?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRoleValue;
    venueId: string | null;
    phone: string | null;
  }
}
