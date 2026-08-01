"use client";

import { useState, type FormEvent } from "react";

export function PasswordHintForm({ currentQuestion }: { currentQuestion: string | null }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setStatus("submitting");
    setErrorMessage("");

    const res = await fetch("/api/mypage/password-hint", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: formData.get("question"),
        answer: formData.get("answer"),
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setStatus("error");
      setErrorMessage(body.error ?? "힌트 저장 중 오류가 발생했습니다.");
      return;
    }

    setStatus("done");
    form.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {currentQuestion && (
        <p className="text-sm text-ink/60">현재 등록된 질문: {currentQuestion}</p>
      )}
      <label className="block text-sm">
        <span className="text-ink/70">비밀번호 힌트 질문</span>
        <input
          name="question"
          required
          placeholder="예: 가장 좋아하는 색은?"
          className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
        />
      </label>
      <label className="block text-sm">
        <span className="text-ink/70">답변</span>
        <input
          name="answer"
          required
          className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
        />
      </label>
      {status === "done" && <p className="text-sm text-terracotta">힌트가 저장되었습니다.</p>}
      {status === "error" && <p className="text-sm text-red-700">{errorMessage}</p>}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-full bg-ink px-8 py-3 text-sm tracking-wide text-base disabled:opacity-60"
      >
        {status === "submitting" ? "저장 중..." : "힌트 저장"}
      </button>
    </form>
  );
}
