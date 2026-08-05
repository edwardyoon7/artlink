"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function ArtistProfileApplyForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const res = await fetch("/api/artist-profile", {
      method: "POST",
      body: formData,
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "신청 중 오류가 발생했습니다.");
      return;
    }

    router.push("/mypage");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <label className="block text-sm">
        <span className="text-ink/70">증명사진 (2x2, 정방형으로 노출됩니다)</span>
        <input
          name="photo"
          type="file"
          accept="image/*"
          required
          className="mt-1 block w-full text-sm text-ink/70 file:mr-4 file:rounded-full file:border-0 file:bg-ink/10 file:px-4 file:py-2 file:text-ink"
        />
      </label>
      <label className="block text-sm">
        <span className="text-ink/70">학력 (선택)</span>
        <textarea
          name="education"
          rows={2}
          className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
        />
      </label>
      <label className="block text-sm">
        <span className="text-ink/70">전시경력 (선택)</span>
        <textarea
          name="exhibitions"
          rows={3}
          className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
        />
      </label>
      <label className="block text-sm">
        <span className="text-ink/70">수상경력 (선택)</span>
        <textarea
          name="awards"
          rows={3}
          className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 outline-none focus:border-ink"
        />
      </label>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-ink px-8 py-3 text-sm tracking-wide text-base disabled:opacity-60"
      >
        {submitting ? "신청 중..." : "프로필 노출 서비스 신청하기"}
      </button>
    </form>
  );
}
