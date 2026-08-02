"use client";

import { useBgTheme } from "@/components/theme-provider";
import { BG_THEME_IMAGES } from "@/lib/theme";

export function ThemeBackground() {
  const { theme } = useBgTheme();
  const image = BG_THEME_IMAGES[theme];

  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 bg-base bg-cover bg-center bg-fixed"
      style={
        image
          ? {
              backgroundImage: `linear-gradient(rgba(245, 241, 234, 0), rgba(245, 241, 234, 0)), url(${image})`,
            }
          : undefined
      }
    />
  );
}
