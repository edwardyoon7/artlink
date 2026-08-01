"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ARTWORK_CATEGORY_LABELS, SELECTABLE_ARTWORK_CATEGORIES } from "@/lib/artwork-category";
import type { ArtworkCategory } from "@/generated/prisma/client";

export function ArtworkCategoryEditor({
  artworkId,
  category,
}: {
  artworkId: string;
  category: ArtworkCategory;
}) {
  const router = useRouter();
  const [value, setValue] = useState<ArtworkCategory>(category);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");

    const res = await fetch(`/api/artworks/${artworkId}/category`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: value }),
    });

    setSaving(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "구분 변경 중 오류가 발생했습니다.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="mt-3 flex items-center gap-2 text-sm">
      <span className="text-ink/60">구분</span>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value as ArtworkCategory)}
        className="rounded-sm border border-ink/20 bg-base px-2 py-1"
      >
        {SELECTABLE_ARTWORK_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {ARTWORK_CATEGORY_LABELS[c]}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleSave}
        disabled={saving || value === category}
        className="rounded-full border border-ink/20 px-3 py-1 text-xs hover:border-ink disabled:opacity-40"
      >
        {saving ? "저장 중..." : "저장"}
      </button>
      {error && <span className="text-red-700">{error}</span>}
    </div>
  );
}
