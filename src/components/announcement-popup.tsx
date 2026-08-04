"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Announcement = { id: string; title: string; content: string };

const STORAGE_KEY = "artieum-dismissed-announcements";

function loadDismissed(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function endOfTodayTimestamp() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

export function AnnouncementPopup({ announcements }: { announcements: Announcement[] }) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState<Announcement[]>([]);
  const [index, setIndex] = useState(0);
  const [hideToday, setHideToday] = useState(false);

  useEffect(() => {
    setMounted(true);
    const dismissed = loadDismissed();
    const now = Date.now();
    setVisible(announcements.filter((a) => !(dismissed[a.id] && dismissed[a.id] > now)));
  }, [announcements]);

  if (!mounted || visible.length === 0) return null;

  const current = visible[index];
  if (!current) return null;

  function closeCurrent() {
    if (hideToday) {
      const dismissed = loadDismissed();
      dismissed[current.id] = endOfTodayTimestamp();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissed));
    }
    setHideToday(false);
    if (index < visible.length - 1) {
      setIndex((i) => i + 1);
    } else {
      setVisible([]);
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/50 px-6"
      onClick={closeCurrent}
    >
      <div
        className="w-full max-w-md rounded-sm border border-ink/10 bg-base p-8 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <span className="font-[var(--font-serif-en)] text-xs tracking-[0.3em] text-terracotta">
            NOTICE{visible.length > 1 ? ` ${index + 1}/${visible.length}` : ""}
          </span>
          <button
            type="button"
            onClick={closeCurrent}
            aria-label="닫기"
            className="text-ink/50 transition-colors hover:text-ink"
          >
            ✕
          </button>
        </div>
        <h2 className="mt-3 font-[var(--font-serif-kr)] text-xl">{current.title}</h2>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink/80">
          {current.content}
        </p>

        <div className="mt-6 flex items-center justify-between gap-4">
          <label className="flex items-center gap-2 text-xs text-ink/60">
            <input
              type="checkbox"
              checked={hideToday}
              onChange={(e) => setHideToday(e.target.checked)}
            />
            오늘 하루 보지 않기
          </label>
          <button
            type="button"
            onClick={closeCurrent}
            className="rounded-full bg-ink px-5 py-2 text-xs tracking-wide text-base"
          >
            {index < visible.length - 1 ? "다음 공지" : "닫기"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
