"use client";

import React, { useRef, useState, useEffect } from "react";
import { CATEGORIES } from "@/constants/categories";
import { SUB_FILTERS } from "@/constants/subFilters";
import { HardwareCategory } from "@/types/deal";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";

interface DealFiltersProps {
  selectedCategory: HardwareCategory;
  onSelectCategory: (cat: HardwareCategory) => void;
  selectedSubFilter: string;
  onSelectSubFilter: (filterId: string) => void;
  categoryCounts: Record<string, number>;
  selectedMerchant: string;
  onSelectMerchant: (merchant: string) => void;
  merchants: string[];
  totalFiltered: number;
}

export const DealFilters: React.FC<DealFiltersProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedSubFilter,
  onSelectSubFilter,
  categoryCounts,
  selectedMerchant,
  onSelectMerchant,
  merchants,
  totalFiltered,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check scroll position to show/hide arrows
  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // 1. Mouse wheel horizontal scroll conversion
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
        checkScroll();
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    checkScroll();

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const distance = 260;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
    setTimeout(checkScroll, 300);
  };

  const activeSubFilters = SUB_FILTERS[selectedCategory] || [];

  return (
    <div className="space-y-4">
      {/* Category Pills Bar with Horizontal Scroll and Nav Chevrons */}
      <div className="relative group">
        {/* Left Scroll Button */}
        {canScrollLeft && (
          <button
            onClick={() => handleScroll("left")}
            aria-label="Faire défiler les catégories vers la gauche"
            className="absolute -left-2 top-1/2 -translate-y-1/2 z-20 flex size-8 items-center justify-center rounded-full bg-[#2D222F] border border-[#4B2138] text-[#FADCD5] shadow-lg shadow-[#1B0C1A]/80 hover:bg-[#6D3C52] transition-colors"
          >
            <ChevronLeft className="size-4" />
          </button>
        )}

        {/* Right Scroll Button */}
        {canScrollRight && (
          <button
            onClick={() => handleScroll("right")}
            aria-label="Faire défiler les catégories vers la droite"
            className="absolute -right-2 top-1/2 -translate-y-1/2 z-20 flex size-8 items-center justify-center rounded-full bg-[#2D222F] border border-[#4B2138] text-[#FADCD5] shadow-lg shadow-[#1B0C1A]/80 hover:bg-[#6D3C52] transition-colors"
          >
            <ChevronRight className="size-4" />
          </button>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar scroll-smooth"
        >
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const count = categoryCounts[cat.id] ?? 0;
            const isActive = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium transition-all duration-150 active:scale-95 ${
                  isActive
                    ? "bg-[#6D3C52] text-[#FADCD5] border border-[#854763] shadow-lg shadow-[#6D3C52]/30"
                    : "bg-[#2D222F]/90 text-[#A88D99] border border-[#4B2138] hover:bg-[#382A3A] hover:text-[#FADCD5] hover:border-[#6D3C52]/50"
                }`}
              >
                <Icon className={`size-4 ${isActive ? "text-[#FADCD5]" : "text-[#A88D99]"}`} />
                <span>{cat.label}</span>
                <span
                  className={`ml-1 rounded-full px-1.5 py-0.2 text-[11px] font-bold tabular-nums ${
                    isActive
                      ? "bg-[#1B0C1A]/40 text-[#FADCD5]"
                      : "bg-[#1B0C1A] text-[#A88D99] border border-[#4B2138]/60"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Sub-Filters Bar (e.g. for SSD: 512Go, 1To, 2To, 4To+) */}
      {activeSubFilters.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto rounded-xl bg-[#2D222F]/60 border border-[#4B2138] p-2 no-scrollbar">
          <div className="flex shrink-0 items-center gap-1.5 px-2 text-xs font-semibold text-[#A88D99]">
            <SlidersHorizontal className="size-3.5 text-[#FADCD5]" />
            <span>Filtres :</span>
          </div>

          <div className="flex items-center gap-1.5">
            {activeSubFilters.map((sub) => {
              const isSubActive = selectedSubFilter === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => onSelectSubFilter(sub.id)}
                  className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition-all active:scale-95 ${
                    isSubActive
                      ? "bg-[#6D3C52] text-[#FADCD5] border border-[#854763] shadow-sm"
                      : "bg-[#1B0C1A]/70 text-[#A88D99] border border-[#4B2138]/60 hover:bg-[#2D222F] hover:text-[#FADCD5]"
                  }`}
                >
                  {sub.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Merchant Sub-bar & Total Count */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#4B2138] pb-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-[#A88D99]">
          <span>Marchand :</span>
          <select
            value={selectedMerchant}
            onChange={(e) => onSelectMerchant(e.target.value)}
            className="rounded-lg border border-[#4B2138] bg-[#2D222F] px-3 py-1.5 text-xs sm:text-sm text-[#FADCD5] focus:border-[#6D3C52] focus:outline-none focus:ring-1 focus:ring-[#6D3C52]"
          >
            <option value="ALL">Tous les marchands</option>
            {merchants.map((m) =>
              m === "ALL" ? null : (
                <option key={m} value={m}>
                  {m}
                </option>
              )
            )}
          </select>
        </div>

        <div className="text-xs text-[#A88D99]">
          <span className="font-bold tabular-nums text-[#FADCD5]">{totalFiltered}</span> bon plan
          {totalFiltered > 1 ? "s" : ""} disponible{totalFiltered > 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
};
