"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Announcement = {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
};

export function AdminAnnouncementRow({ announcement }: { announcement: Announcement }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(announcement.title);
  const [content, setContent] = useState(announcement.content);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function saveEdit() {
    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 모두 입력해주세요.");
      return;
    }
    setSubmitting(true);
    setError("");
    const res = await fetch(`/api/announcements/${announcement.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "저장 중 오류가 발생했습니다.");
      return;
    }
    setEditing(false);
    router.refresh();
  }

  async function toggleActive() {
    setSubmitting(true);
    setError("");
    const res = await fetch(`/api/announcements/${announcement.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !announcement.isActive }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "처리 중 오류가 발생했습니다.");
      return;
    }
    router.refresh();
  }

  async function remove() {
    if (!window.confirm("이 공지사항을 삭제하시겠습니까? 되돌릴 수 없습니다.")) return;
    setSubmitting(true);
    setError("");
    const res = await fetch(`/api/announcements/${announcement.id}`, { method: "DELETE" });
    setSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "삭제 중 오류가 발생했습니다.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="rounded-sm border border-ink/20 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span
          className={`rounded-full px-3 py-1 text-xs tracking-wide ${
            announcement.isActive ? "bg-ink text-base" : "bg-ink/10 text-ink"
          }`}
        >
          {announcement.isActive ? "게시 중" : "숨김"}
        </span>
        <span className="text-xs text-ink/50">등록일 {announcement.createdAt}</span>
      </div>

      {!editing ? (
        <>
          <p className="mt-3 font-[var(--font-serif-kr)] text-lg">{announcement.title}</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-ink/70">{announcement.content}</p>
        </>
      ) : (
        <div className="mt-4 space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-sm border border-ink/20 bg-base px-3 py-1.5 text-sm outline-none focus:border-ink"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full rounded-sm border border-ink/20 bg-base px-3 py-1.5 text-sm outline-none focus:border-ink"
          />
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        {editing ? (
          <>
            <button
              disabled={submitting}
              onClick={saveEdit}
              className="rounded-full bg-ink px-4 py-1.5 text-xs tracking-wide text-base disabled:opacity-40"
            >
              저장
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                setEditing(false);
                setTitle(announcement.title);
                setContent(announcement.content);
                setError("");
              }}
              className="rounded-full border border-ink/30 px-4 py-1.5 text-xs tracking-wide text-ink"
            >
              취소
            </button>
          </>
        ) : (
          <>
            <button
              disabled={submitting}
              onClick={() => setEditing(true)}
              className="rounded-full border border-ink/30 px-4 py-1.5 text-xs tracking-wide text-ink transition-colors hover:bg-ink hover:text-base disabled:opacity-40"
            >
              수정
            </button>
            <button
              disabled={submitting}
              onClick={toggleActive}
              className="rounded-full border border-ink/30 px-4 py-1.5 text-xs tracking-wide text-ink transition-colors hover:bg-ink hover:text-base disabled:opacity-40"
            >
              {announcement.isActive ? "숨기기" : "게시하기"}
            </button>
            <button
              disabled={submitting}
              onClick={remove}
              className="rounded-full border border-red-300 px-4 py-1.5 text-xs tracking-wide text-red-700 transition-colors hover:bg-red-100 disabled:opacity-40"
            >
              삭제
            </button>
          </>
        )}
      </div>
    </div>
  );
}
