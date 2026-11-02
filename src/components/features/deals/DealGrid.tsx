"use client";

import React from "react";
import { Deal } from "@/types/deal";
import { DealCard } from "./DealCard";
import { SearchX } from "lucide-react";

interface DealGridProps {
  deals: Deal[];
  loading: boolean;
  onResetFilters: () => void;
}

export const DealGrid: React.FC<DealGridProps> = ({ deals, loading, onResetFilters }) => {
  // Skeleton loader styled with Sakura palette
  if (loading) {
    return (
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col rounded-2xl border border-[#4B2138] bg-[#2D222F]/40 p-4 animate-pulse"
          >
            <div className="mb-3 h-44 w-full rounded-xl bg-[#1B0C1A]" />
            <div className="mb-2 h-3 w-1/3 rounded bg-[#4B2138]/50" />
            <div className="mb-1 h-4 w-3/4 rounded bg-[#4B2138]/60" />
            <div className="mb-4 h-4 w-1/2 rounded bg-[#4B2138]/40" />
            <div className="mt-auto flex items-center justify-between border-t border-[#4B2138] pt-3">
              <div className="h-6 w-20 rounded bg-[#4B2138]/50" />
              <div className="h-8 w-24 rounded-xl bg-[#6D3C52]/30" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-[#4B2138] bg-[#2D222F]/40 p-12 text-center">
        <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-[#1B0C1A] text-[#FADCD5] border border-[#4B2138]">
          <SearchX className="size-6" />
        </div>
        <p className="text-base font-semibold text-[#FADCD5]">Aucun composant ne correspond à cette recherche</p>
        <p className="mt-1 text-sm text-[#A88D99] text-pretty">
          Essayez un autre mot-clé ou réinitialisez les filtres pour voir tous les bons plans.
        </p>
        <button
          onClick={onResetFilters}
          className="mt-5 rounded-xl bg-[#6D3C52] border border-[#854763] px-5 py-2 text-xs font-semibold text-[#FADCD5] hover:bg-[#854763] transition-colors active:scale-95 shadow-md shadow-[#6D3C52]/20"
        >
          Réinitialiser les filtres
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {deals.map((deal) => (
        <DealCard key={deal.id} deal={deal} />
      ))}
    </div>
  );
};
