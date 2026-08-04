"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function AnnouncementCreateForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "등록 중 오류가 발생했습니다.");
      return;
    }
    setTitle("");
    setContent("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-sm border border-ink/20 p-6">
      <p className="text-sm font-medium">새 공지사항 등록</p>
      <p className="mt-1 text-xs text-ink/50">
        등록하면 바로 “게시 중” 상태가 되어 메인 화면에 팝업으로 노출됩니다.
      </p>
      <div className="mt-4 space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
          required
          className="w-full rounded-sm border border-ink/20 bg-base px-3 py-2 text-sm outline-none focus:border-ink"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용"
          rows={4}
          required
          className="w-full rounded-sm border border-ink/20 bg-base px-3 py-2 text-sm outline-none focus:border-ink"
        />
      </div>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="mt-4 rounded-full bg-ink px-5 py-2 text-xs tracking-wide text-base disabled:opacity-60"
      >
        {submitting ? "등록 중..." : "등록"}
      </button>
    </form>
  );
}
