"use client";

import React from "react";
import { Flame, RefreshCw, BellRing } from "lucide-react";

interface HeaderProps {
  syncing: boolean;
  onSync: () => void;
}

export const Header: React.FC<HeaderProps> = ({ syncing, onSync }) => {
  return (
    <header className="sticky top-0 z-40 border-b border-[#4B2138] bg-[#1B0C1A]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#6D3C52] to-[#4B2138] border border-[#854763]/40 shadow-lg shadow-[#6D3C52]/20">
            <Flame className="size-5 text-[#FADCD5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-[#FADCD5]">
                Hardware<span className="text-[#E8BFB6]">Deals</span>
              </span>
              <span className="inline-flex items-center rounded-full bg-[#6D3C52]/30 px-2 py-0.5 text-xs font-semibold text-[#FADCD5] border border-[#6D3C52]/50">
                <span className="mr-1.5 size-1.5 rounded-full bg-[#FADCD5] animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-xs text-[#A88D99]">Le radar des meilleurs bons plans PC & Hardware</p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#2D222F] border border-[#4B2138] text-xs text-[#FADCD5]">
            <BellRing className="size-4 text-[#FADCD5]" />
            <span>Discord Alertes Actif</span>
          </div>

          <button
            onClick={onSync}
            disabled={syncing}
            aria-label="Scanner le web pour de nouveaux deals"
            className="flex items-center gap-2 rounded-xl bg-[#6D3C52] px-4 py-2 text-xs sm:text-sm font-semibold text-[#FADCD5] border border-[#854763] hover:bg-[#854763] transition-colors active:scale-95 disabled:opacity-50 shadow-md shadow-[#6D3C52]/20"
          >
            <RefreshCw className={`size-4 ${syncing ? "animate-spin text-[#FADCD5]" : ""}`} />
            <span className="hidden sm:inline">{syncing ? "Scan en cours..." : "Scanner le Web"}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
