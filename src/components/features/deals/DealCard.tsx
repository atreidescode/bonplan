"use client";

import React, { useState } from "react";
import { Deal } from "@/types/deal";
import { CATEGORY_STYLES } from "@/constants/categories";
import { analyzeHardwareDeal } from "@/lib/services/hardwareAnalyzer";
import { ExternalLink, Layers, CheckCircle2, Flame, HardDrive, Sparkles } from "lucide-react";

interface DealCardProps {
  deal: Deal;
}

export const DealCard: React.FC<DealCardProps> = ({ deal }) => {
  const [copied, setCopied] = useState(false);

  const catStyle = CATEGORY_STYLES[deal.category] || CATEGORY_STYLES.OTHER;
  const analysis = analyzeHardwareDeal(deal);
  const isHotDeal = typeof deal.temperature === "number" && deal.temperature >= 250;

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(deal.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#2D222F] hover:shadow-xl ${
        analysis.isTargetPriceHit || isHotDeal
          ? "border-[#854763] bg-[#2D222F]/85 shadow-lg shadow-[#6D3C52]/15 hover:border-[#FADCD5]/60"
          : "border-[#4B2138] bg-[#2D222F]/70 hover:border-[#6D3C52] hover:shadow-[#6D3C52]/15"
      }`}
    >
      {/* Product Image Frame */}
      <div className="relative mb-3 flex h-44 w-full items-center justify-center overflow-hidden rounded-xl bg-[#1B0C1A] p-2 border border-[#4B2138]/50">
        {deal.imageUrl ? (
          <img
            src={deal.imageUrl}
            alt={deal.title}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <HardDrive className="size-12 text-[#4B2138]" />
        )}

        {/* Category Badge */}
        <span
          className={`absolute left-2.5 top-2.5 rounded-lg border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider backdrop-blur-md ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
        >
          {deal.category}
        </span>

        {/* Discount Badge */}
        {deal.discountPercentage && deal.discountPercentage > 0 && (
          <span className="absolute right-2.5 top-2.5 rounded-lg bg-[#6D3C52] border border-[#854763] px-2 py-0.5 text-xs font-bold tabular-nums text-[#FADCD5] shadow-md shadow-[#1B0C1A]/50">
            -{Math.round(deal.discountPercentage)}%
          </span>
        )}

        {/* Bottom-left Temperature Badge */}
        {typeof deal.temperature === "number" && deal.temperature > 50 && (
          <span
            className={`absolute left-2.5 bottom-2.5 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold tabular-nums backdrop-blur-sm ${
              isHotDeal
                ? "bg-[#6D3C52] text-[#FADCD5] border border-[#FADCD5]/50 shadow-sm"
                : "bg-[#2D222F]/90 text-[#FADCD5] border border-[#6D3C52]/40"
            }`}
          >
            <Flame className="size-3 text-[#FADCD5]" />
            <span>{deal.temperature}°</span>
          </span>
        )}

        {/* Bottom-right Target Price Badge */}
        {analysis.isTargetPriceHit && (
          <span
            title={analysis.targetPriceReason}
            className="absolute right-2.5 bottom-2.5 flex items-center gap-1 rounded-md bg-[#1B0C1A]/90 border border-[#FADCD5]/50 px-2 py-0.5 text-[11px] font-bold text-[#FADCD5] backdrop-blur-sm"
          >
            <Sparkles className="size-3 text-[#FADCD5]" />
            <span>Prix Cible</span>
          </span>
        )}
      </div>

      {/* Merchant & Source Info */}
      <div className="flex items-center justify-between text-xs text-[#A88D99] mb-1.5">
        <span className="font-semibold text-[#FADCD5] truncate max-w-[65%]">{deal.merchant}</span>
        <span className="text-xs uppercase tracking-wide text-[#A88D99]/80 shrink-0">
          via {deal.source}
        </span>
      </div>

      {/* Deal Title */}
      <h3
        className="line-clamp-2 text-sm font-semibold text-[#FADCD5] group-hover:text-[#E8BFB6] transition-colors duration-150"
        title={deal.title}
      >
        {deal.title}
      </h3>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Price & Smart Ratio (€/To or €/Go) Section */}
      <div className="mt-4 flex items-center justify-between border-t border-[#4B2138] pt-3">
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-extrabold tabular-nums text-[#FADCD5]">
            {deal.price > 0 ? `${deal.price.toFixed(2)} €` : "Voir l'offre"}
          </span>
          {deal.originalPrice && deal.originalPrice > deal.price && (
            <span className="text-xs text-[#A88D99] line-through tabular-nums">
              {deal.originalPrice.toFixed(2)} €
            </span>
          )}
        </div>

        {/* Unit Metric Pill (€/To for SSD or €/Go for RAM) */}
        {analysis.unitMetricLabel && (
          <span
            className={`rounded-lg px-2 py-0.5 text-[11px] font-bold tabular-nums border ${
              analysis.isGreatUnitMetric
                ? "bg-[#6D3C52]/40 text-[#FADCD5] border-[#854763]"
                : "bg-[#1B0C1A]/70 text-[#A88D99] border-[#4B2138]"
            }`}
          >
            {analysis.isGreatUnitMetric ? `🔥 ${analysis.unitMetricLabel}` : analysis.unitMetricLabel}
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-3 flex gap-2">
        <a
          href={deal.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#6D3C52] border border-[#854763] px-3 py-2 text-xs font-semibold text-[#FADCD5] shadow-md shadow-[#6D3C52]/20 hover:bg-[#854763] transition-colors active:scale-95"
        >
          <span>Voir le deal</span>
          <ExternalLink className="size-3.5" />
        </a>

        <button
          onClick={handleCopy}
          aria-label="Copier le lien direct de l'offre"
          className="flex items-center justify-center rounded-xl border border-[#4B2138] bg-[#1B0C1A]/80 px-2.5 py-2 text-[#A88D99] hover:bg-[#2D222F] hover:text-[#FADCD5] transition-colors active:scale-95"
        >
          {copied ? (
            <CheckCircle2 className="size-4 text-[#FADCD5]" />
          ) : (
            <Layers className="size-4" />
          )}
        </button>
      </div>
    </article>
  );
};
