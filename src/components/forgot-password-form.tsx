"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const res = await fetch("/api/forgot-password/question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const body = await res.json().catch(() => ({}));

    setStatus("idle");
    if (!res.ok) {
      setErrorMessage(body.error ?? "계정을 확인할 수 없습니다.");
      return;
    }

    setQuestion(body.question);
    setStep("reset");
  }

  async function handleResetSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const newPassword = formData.get("newPassword") as string;
    const newPasswordConfirm = formData.get("newPasswordConfirm") as string;
    if (newPassword !== newPasswordConfirm) {
      setStatus("error");
      setErrorMessage("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    const res = await fetch("/api/forgot-password/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        answer: formData.get("answer"),
        newPassword,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setStatus("error");
      setErrorMessage(body.error ?? "비밀번호 재설정 중 오류가 발생했습니다.");
      return;
    }

    router.push("/login");
  }

  if (step === "email") {
    return (
      <form onSubmit={handleEmailSubmit} className="mt-8 space-y-4">
        <label className="block text-sm">
          <span className="text-ink/70">이메일</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
          />
        </label>
        {errorMessage && <p className="text-sm text-red-700">{errorMessage}</p>}
        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full rounded-full bg-ink px-8 py-3 text-sm tracking-wide text-base disabled:opacity-60"
        >
          {status === "submitting" ? "확인 중..." : "다음"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleResetSubmit} className="mt-8 space-y-4">
      <p className="text-sm text-ink/70">힌트 질문: {question}</p>
      <label className="block text-sm">
        <span className="text-ink/70">답변</span>
        <input
          name="answer"
          required
          className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-ink/70">새 비밀번호 (8자 이상)</span>
          <input
            name="newPassword"
            type="password"
            minLength={8}
            required
            className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
          />
        </label>
        <label className="block text-sm">
          <span className="text-ink/70">새 비밀번호 확인</span>
          <input
            name="newPasswordConfirm"
            type="password"
            minLength={8}
            required
            className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
          />
        </label>
      </div>
      {errorMessage && <p className="text-sm text-red-700">{errorMessage}</p>}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-full bg-ink px-8 py-3 text-sm tracking-wide text-base disabled:opacity-60"
      >
        {status === "submitting" ? "재설정 중..." : "비밀번호 재설정"}
      </button>
    </form>
  );
}
