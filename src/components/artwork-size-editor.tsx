"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ArtworkSizeEditor({
  artworkId,
  widthCm,
  heightCm,
}: {
  artworkId: string;
  widthCm: number | null;
  heightCm: number | null;
}) {
  const router = useRouter();
  const [width, setWidth] = useState(widthCm != null ? String(widthCm) : "");
  const [height, setHeight] = useState(heightCm != null ? String(heightCm) : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");

    const res = await fetch(`/api/artworks/${artworkId}/size`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ widthCm: Number(width), heightCm: Number(height) }),
    });

    setSaving(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "크기 저장 중 오류가 발생했습니다.");
      return;
    }

    router.refresh();
  }

  const unchanged =
    width === (widthCm != null ? String(widthCm) : "") &&
    height === (heightCm != null ? String(heightCm) : "");

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
      <span className="text-ink/60">실제 크기</span>
      <input
        type="number"
        min={1}
        max={1000}
        step="0.1"
        value={width}
        onChange={(e) => setWidth(e.target.value)}
        placeholder="가로(cm)"
        className="w-24 rounded-sm border border-ink/20 bg-base px-2 py-1"
      />
      <span className="text-ink/40">×</span>
      <input
        type="number"
        min={1}
        max={1000}
        step="0.1"
        value={height}
        onChange={(e) => setHeight(e.target.value)}
        placeholder="세로(cm)"
        className="w-24 rounded-sm border border-ink/20 bg-base px-2 py-1"
      />
      <span className="text-ink/40">cm</span>
      <button
        type="button"
        onClick={handleSave}
        disabled={saving || unchanged || !width || !height}
        className="rounded-full border border-ink/20 px-3 py-1 text-xs hover:border-ink disabled:opacity-40"
      >
        {saving ? "저장 중..." : "저장"}
      </button>
      {error && <span className="text-red-700">{error}</span>}
      {widthCm == null && (
        <span className="w-full text-xs text-terracotta">
          크기를 등록하면 “ARTIEUM VIRTUAL” 가상 배치 미리보기가 상세 페이지에 노출됩니다.
        </span>
      )}
    </div>
  );
}
