"use client";

import { useState, type FormEvent } from "react";

export function PasswordChangeForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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

    const res = await fetch("/api/mypage/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: formData.get("currentPassword"),
        newPassword,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setStatus("error");
      setErrorMessage(body.error ?? "비밀번호 변경 중 오류가 발생했습니다.");
      return;
    }

    setStatus("done");
    form.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-sm">
        <span className="text-ink/70">현재 비밀번호</span>
        <input
          name="currentPassword"
          type="password"
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
      {status === "done" && <p className="text-sm text-terracotta">비밀번호가 변경되었습니다.</p>}
      {status === "error" && <p className="text-sm text-red-700">{errorMessage}</p>}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-full bg-ink px-8 py-3 text-sm tracking-wide text-base disabled:opacity-60"
      >
        {status === "submitting" ? "변경 중..." : "비밀번호 변경"}
      </button>
    </form>
  );
}
