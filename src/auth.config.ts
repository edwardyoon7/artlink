import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;

      if (nextUrl.pathname.startsWith("/admin")) {
        return isLoggedIn && role === "ADMIN";
      }
      if (nextUrl.pathname.startsWith("/mypage")) {
        return isLoggedIn;
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as "APPLICANT" | "ADMIN" | "COLLECTOR";
        session.user.id = token.id as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
