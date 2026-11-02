"use client";

import React from "react";
import { Search } from "lucide-react";

interface HeroSectionProps {
  search: string;
  onSearchChange: (value: string) => void;
  totalDeals: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  search,
  onSearchChange,
}) => {
  return (
    <section className="relative overflow-hidden border-b border-[#4B2138] bg-gradient-to-b from-[#2D222F]/40 via-[#1B0C1A] to-[#1B0C1A] py-10 px-4 sm:px-6">
      {/* Background Sakura Ambience Glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-64 w-[600px] rounded-full bg-[#6D3C52]/10 blur-3xl" />

      <div className="relative mx-auto max-w-4xl text-center">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#FADCD5] text-balance leading-tight">
          Vos composants PC au{" "}
          <span className="bg-gradient-to-r from-[#FADCD5] via-[#E8BFB6] to-[#6D3C52] bg-clip-text text-transparent">
            meilleur prix
          </span>
        </h1>
        <p className="mt-3 text-sm sm:text-base text-[#A88D99] max-w-2xl mx-auto text-pretty">
          Détection en direct des promos GPU, CPU, RAM, SSD et pièces informatiques sur Dealabs,
          TopAchat et les marchands high-tech.
        </p>

        {/* Search Bar */}
        <div className="mt-6 flex items-center justify-center">
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#A88D99] pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Rechercher une RTX 5080, Ryzen 7 7800X3D, DDR5 6000MHz, SSD 2To..."
              className="w-full rounded-2xl border border-[#4B2138] bg-[#2D222F]/90 py-3.5 pl-12 pr-12 text-sm text-[#FADCD5] placeholder:text-[#A88D99] focus:border-[#6D3C52] focus:outline-none focus:ring-2 focus:ring-[#6D3C52]/30 shadow-xl shadow-[#1B0C1A]/60 transition-all"
            />
            {search && (
              <button
                onClick={() => onSearchChange("")}
                aria-label="Effacer la recherche"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-xs text-[#A88D99] hover:text-[#FADCD5] transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
