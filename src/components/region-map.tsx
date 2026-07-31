"use client";

import { REGIONS, REGION_GRID_AREAS } from "@/lib/regions";

export function RegionMap({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (region: string) => void;
}) {
  return (
    <div
      className="grid gap-1.5"
      style={{ gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gridTemplateRows: "repeat(8, 2.5rem)" }}
    >
      {REGIONS.map((region) => (
        <button
          key={region}
          type="button"
          onClick={() => onSelect(region)}
          style={{ gridRow: REGION_GRID_AREAS[region].split("/")[0].trim() + " / " + REGION_GRID_AREAS[region].split("/")[2].trim(), gridColumn: REGION_GRID_AREAS[region].split("/")[1].trim() + " / " + REGION_GRID_AREAS[region].split("/")[3].trim() }}
          className={`rounded-sm border px-1 text-[11px] leading-tight transition-colors ${
            selected === region
              ? "border-terracotta bg-terracotta text-base"
              : "border-ink/20 bg-white/40 text-ink/70 hover:border-ink"
          }`}
        >
          {region.replace("특별자치도", "").replace("특별자치시", "").replace("광역시", "").replace("특별시", "").replace("도", "")}
        </button>
      ))}
    </div>
  );
}
