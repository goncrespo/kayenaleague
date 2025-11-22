import NextAuth, { type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

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
        return { id: user.id, name: user.name || undefined, email: user.email || undefined, image: user.image || undefined, role: (user as any).role } as any;
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
        (token as any).id = (user as any).id;
        (token as any).role = (user as any).role ?? "USER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = (token as any).id;
        (session.user as any).role = (token as any).role ?? "USER";
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
      } catch {}
      // Por defecto, vuelve al home del mismo origen
      return baseUrl;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 