import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: "APPLICANT" | "ADMIN" | "COLLECTOR";
  }

  interface Session {
    user: {
      id: string;
      role: "APPLICANT" | "ADMIN" | "COLLECTOR";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "APPLICANT" | "ADMIN" | "COLLECTOR";
    id?: string;
  }
}
