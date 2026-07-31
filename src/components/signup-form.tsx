"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const password = formData.get("password");
    const passwordConfirm = formData.get("passwordConfirm");
    if (password !== passwordConfirm) {
      setSubmitting(false);
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        password,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "가입 처리 중 오류가 발생했습니다.");
      return;
    }

    router.push("/login");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <label className="block text-sm">
        <span className="text-ink/70">성함</span>
        <input
          name="name"
          required
          className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
        />
      </label>
      <label className="block text-sm">
        <span className="text-ink/70">전화번호</span>
        <input
          name="phone"
          type="tel"
          required
          className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
        />
      </label>
      <label className="block text-sm">
        <span className="text-ink/70">이메일</span>
        <input
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-ink/70">비밀번호 (8자 이상)</span>
          <input
            name="password"
            type="password"
            minLength={8}
            required
            className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
          />
        </label>
        <label className="block text-sm">
          <span className="text-ink/70">비밀번호 확인</span>
          <input
            name="passwordConfirm"
            type="password"
            minLength={8}
            required
            className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
          />
        </label>
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-ink px-8 py-3 text-sm tracking-wide text-base disabled:opacity-60"
      >
        {submitting ? "가입 처리 중..." : "회원가입"}
      </button>
    </form>
  );
}
