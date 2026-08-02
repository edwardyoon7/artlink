export type BgTheme = "venus" | "mercury" | "jupiter" | "basic";

export const BG_THEMES: BgTheme[] = ["venus", "mercury", "jupiter", "basic"];

export const DEFAULT_BG_THEME: BgTheme = "venus";

export const BG_THEME_LABELS: Record<BgTheme, string> = {
  venus: "Venus",
  mercury: "Mercury",
  jupiter: "Jupiter",
  basic: "Basic",
};

export const BG_THEME_IMAGES: Record<BgTheme, string | null> = {
  venus: "/theme-bg/venus.jpg",
  mercury: "/theme-bg/mercury.jpg",
  jupiter: "/theme-bg/jupiter.jpg",
  basic: null,
};

export const BG_THEME_STORAGE_KEY = "artieum-bg-theme";

export function isBgTheme(value: string | null): value is BgTheme {
  return !!value && (BG_THEMES as string[]).includes(value);
}
