import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION_MS } from "@/lib/login-security";

// 잠금 상태일 때 던지는 전용 에러 — LoginForm에서 result.error === "AccountLocked"로
// 구분해 "비밀번호가 틀렸습니다"가 아닌 "너무 많이 시도했습니다" 메시지를 보여줄 수 있다.
class AccountLockedError extends CredentialsSignin {
  code = "AccountLocked";
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        // 잠금 상태면 비밀번호 검증 자체를 건너뛴다(불필요한 bcrypt 연산도 줄임)
        if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
          throw new AccountLockedError();
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          const attempts = user.failedLoginAttempts + 1;
          const lockingNow = attempts >= MAX_LOGIN_ATTEMPTS;
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: lockingNow ? 0 : attempts,
              lockedUntil: lockingNow ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null,
            },
          });
          if (lockingNow) throw new AccountLockedError();
          return null;
        }

        // 로그인 성공 — 실패 카운트 초기화
        if (user.failedLoginAttempts > 0 || user.lockedUntil) {
          await prisma.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: 0, lockedUntil: null },
          });
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
});
