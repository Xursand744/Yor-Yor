import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { UserRoleValue } from "@/types/next-auth";
import bcrypt from "bcrypt";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { normalizeUzPhone } from "@/lib/phone";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Telefon va parol",
      credentials: {
        name: { label: "Ism", type: "text" },
        phone: { label: "Telefon", type: "text" },
        password: { label: "Parol", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.phone) {
          return null;
        }

        try {
          const phone = normalizeUzPhone(credentials.phone);
          const user = await prisma.user.findUnique({
            where: { phone },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              venueId: true,
              phone: true,
              password: true,
            },
          });

          if (!user) {
            console.error("[auth] Foydalanuvchi topilmadi:", phone);
            return null;
          }

          const password = credentials.password?.trim() ?? "";

          if (password) {
            const valid = await bcrypt.compare(password, user.password);
            if (!valid) {
              console.error("[auth] Parol noto'g'ri:", phone);
              return null;
            }
          } else if (credentials.name?.trim()) {
            const name = credentials.name.trim();
            if (user.name.trim().toLowerCase() !== name.toLowerCase()) {
              console.error("[auth] Ism noto'g'ri:", name);
              return null;
            }
          } else {
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role as UserRoleValue,
            venueId: user.venueId,
            phone: user.phone,
          };
        } catch (error) {
          console.error("[auth] DB xatosi:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.venueId = user.venueId ?? null;
        token.phone = user.phone ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role as UserRoleValue;
        session.user.venueId = (token.venueId as string | null) ?? null;
        session.user.phone = (token.phone as string | null) ?? null;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export function getAuthSession() {
  return getServerSession(authOptions);
}
