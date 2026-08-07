export function SiteFooter() {
  return (
    <footer className="border-t border-ink/10 bg-base px-6 py-12 text-sm">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center md:flex-row md:items-start md:justify-between md:text-left">
        <div>
          <p className="font-[var(--font-serif-en)] text-xs tracking-[0.35em] text-terracotta">
            ART·IEUM
          </p>
          <p className="mt-2 text-ink/60">
            대표 윤진수 (애다기획 대표 · AEDA협회 대표)
          </p>
        </div>
        <div className="space-y-1 text-ink/60">
          <p>경기도 김포시 사우동 923 보보스프라자 3층</p>
          <p>010-7406-6537 · edwardyoon7@artieum.kr</p>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-6xl text-center text-xs text-ink/40">
        © {new Date().getFullYear()} Artieum
      </p>
    </footer>
  );
}
