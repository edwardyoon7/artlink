"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function GoodsIdeaForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const res = await fetch("/api/goods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.get("title"),
        concept: formData.get("concept"),
        targetAudience: formData.get("targetAudience"),
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "제출 중 오류가 발생했습니다.");
      return;
    }

    router.push("/mypage");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <label className="block text-sm">
        <span className="text-ink/70">굿즈 아이디어 제목</span>
        <input
          name="title"
          required
          className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
        />
      </label>
      <label className="block text-sm">
        <span className="text-ink/70">아이디어 설명 (디자인 방향, 원하는 굿즈 형태 등)</span>
        <textarea
          name="concept"
          required
          rows={5}
          className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
        />
      </label>
      <label className="block text-sm">
        <span className="text-ink/70">타겟층 메모 (선택)</span>
        <textarea
          name="targetAudience"
          rows={3}
          placeholder="예: 20대 여성, 전시 방문객, 온라인 컬렉터 등"
          className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
        />
      </label>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-ink px-8 py-3 text-sm tracking-wide text-base disabled:opacity-60"
      >
        {submitting ? "제출 중..." : "아이디어 제출하기"}
      </button>
    </form>
  );
}
