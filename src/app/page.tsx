"use client";

import { useDeals } from "@/hooks/useDeals";
import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/layout/HeroSection";
import { DealFilters } from "@/components/features/deals/DealFilters";
import { DealGrid } from "@/components/features/deals/DealGrid";

export default function HomePage() {
  const {
    deals,
    totalCount,
    loading,
    syncing,
    selectedCategory,
    setSelectedCategory,
    selectedSubFilter,
    setSelectedSubFilter,
    selectedMerchant,
    setSelectedMerchant,
    search,
    setSearch,
    merchants,
    categoryCounts,
    handleSync,
  } = useDeals();

  const handleResetFilters = () => {
    setSelectedCategory("ALL");
    setSelectedSubFilter("ALL");
    setSelectedMerchant("ALL");
    setSearch("");
  };

  return (
    <div className="min-h-dvh bg-[#1B0C1A] text-[#FADCD5] selection:bg-[#6D3C52] selection:text-[#FADCD5]">
      {/* Organism: Top Navigation */}
      <Header syncing={syncing} onSync={handleSync} />

      {/* Organism: Hero Banner & Search */}
      <HeroSection search={search} onSearchChange={setSearch} totalDeals={totalCount} />

      {/* Main Section */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Molecule: Category, Sub-Filters & Merchant Filter Controls */}
        <DealFilters
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedSubFilter={selectedSubFilter}
          onSelectSubFilter={setSelectedSubFilter}
          categoryCounts={categoryCounts}
          selectedMerchant={selectedMerchant}
          onSelectMerchant={setSelectedMerchant}
          merchants={merchants}
          totalFiltered={deals.length}
        />

        {/* Organism: Responsive Deals Grid */}
        <DealGrid
          deals={deals}
          loading={loading}
          onResetFilters={handleResetFilters}
        />
      </main>
    </div>
  );
}
