import NextAuth, { type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

const defaultHost =
  process.env.NEXTAUTH_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = defaultHost;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password || "";
        if (!email || !password) return null;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.hashedPassword) return null;
        const ok = await bcrypt.compare(password, user.hashedPassword);
        if (!ok) return null;
        if (!user.emailVerified) return null;
        const u = user as unknown as { role: string; id: string };
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: u.role
        };
      },
    }),
  ],
  pages: {
    signIn: "/signin",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as unknown as { role: string; id: string };
        token.id = u.id;
        token.role = u.role ?? "USER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const t = token as unknown as { role: string; id: string };
        (session.user as { id: string; role: string }).id = t.id;
        (session.user as { id: string; role: string }).role = t.role ?? "USER";
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Permitir URLs relativas
      if (url.startsWith("/")) return url;
      // Permitir URLs del mismo origen
      try {
        const u = new URL(url);
        if (u.origin === baseUrl) return url;
      } catch { }
      // Por defecto, vuelve al home del mismo origen
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };