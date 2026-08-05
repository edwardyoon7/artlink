"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Profile = {
  photoUrl: string | null;
  education: string | null;
  exhibitions: string | null;
  awards: string | null;
};

export function ArtistProfileEditor({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSaved(false);

    const formData = new FormData(event.currentTarget);
    const res = await fetch("/api/artist-profile", {
      method: "PATCH",
      body: formData,
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "저장 중 오류가 발생했습니다.");
      return;
    }

    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-sm border border-ink/10 bg-ink/5 p-4">
      <div className="flex items-center gap-4">
        {profile.photoUrl && (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-sm">
            <Image src={profile.photoUrl} alt="프로필 사진" fill sizes="64px" className="object-cover" />
          </div>
        )}
        <label className="block text-sm">
          <span className="text-ink/70">사진 교체 (선택)</span>
          <input
            name="photo"
            type="file"
            accept="image/*"
            className="mt-1 block text-xs text-ink/70 file:mr-3 file:rounded-full file:border-0 file:bg-ink/10 file:px-3 file:py-1.5 file:text-ink"
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className="text-ink/70">학력</span>
        <textarea
          name="education"
          rows={2}
          defaultValue={profile.education ?? ""}
          className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 text-sm outline-none focus:border-ink"
        />
      </label>
      <label className="block text-sm">
        <span className="text-ink/70">전시경력</span>
        <textarea
          name="exhibitions"
          rows={3}
          defaultValue={profile.exhibitions ?? ""}
          className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 text-sm outline-none focus:border-ink"
        />
      </label>
      <label className="block text-sm">
        <span className="text-ink/70">수상경력</span>
        <textarea
          name="awards"
          rows={3}
          defaultValue={profile.awards ?? ""}
          className="mt-1 w-full rounded-sm border border-ink/20 bg-base px-3 py-2 text-sm outline-none focus:border-ink"
        />
      </label>
      {error && <p className="text-sm text-red-700">{error}</p>}
      {saved && !error && <p className="text-sm text-ink/60">저장되었습니다.</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-ink px-5 py-2 text-xs tracking-wide text-base disabled:opacity-60"
      >
        {submitting ? "저장 중..." : "프로필 저장"}
      </button>
    </form>
  );
}
