"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    setSubmitting(false);

    if (result?.error) {
      setError(
        result.code === "AccountLocked"
          ? "비밀번호를 여러 번 잘못 입력해 일시적으로 로그인이 제한되었습니다. 15분 후 다시 시도해주세요."
          : "이메일 또는 비밀번호가 올바르지 않습니다."
      );
      return;
    }

    const session = await getSession();
    const role = session?.user?.role;
    const destination = role === "ADMIN" ? "/admin" : role === "COLLECTOR" ? "/" : "/mypage";
    router.push(destination);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <label className="block text-sm">
        <span className="text-ink/70">이메일</span>
        <input
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
        />
      </label>
      <label className="block text-sm">
        <span className="text-ink/70">비밀번호</span>
        <input
          name="password"
          type="password"
          required
          className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
        />
      </label>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-ink px-8 py-3 text-sm tracking-wide text-base disabled:opacity-60"
      >
        {submitting ? "로그인 중..." : "로그인"}
      </button>
      <p className="text-center text-sm">
        <Link href="/forgot-password" className="text-ink/60 underline hover:text-ink">
          비밀번호를 잊으셨나요?
        </Link>
      </p>
      <p className="text-center text-sm text-ink/60">
        계정이 없으신가요?{" "}
        <Link href="/signup" className="underline hover:text-ink">
          회원가입
        </Link>
      </p>
    </form>
  );
}
