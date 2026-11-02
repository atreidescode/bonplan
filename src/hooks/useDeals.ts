import { useState, useEffect, useMemo, useCallback } from "react";
import { Deal, HardwareCategory } from "@/types/deal";
import { SUB_FILTERS } from "@/constants/subFilters";

export function useDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedCategory, setSelectedCategoryState] = useState<HardwareCategory>("ALL");
  const [selectedSubFilter, setSelectedSubFilter] = useState<string>("ALL");
  const [selectedMerchant, setSelectedMerchant] = useState("ALL");
  const [search, setSearch] = useState("");

  const fetchDeals = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch up to 400 active deals so all categories (GPU, SSD, CPU, etc.) are present
      const res = await fetch("/api/deals?limit=400");
      const data = await res.json();
      if (data.deals) {
        setDeals(data.deals);
      }
      if (data.categoryCounts) {
        setCategoryCounts(data.categoryCounts);
      }
    } catch (err) {
      console.error("Error loading deals:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSync = async () => {
    try {
      setSyncing(true);
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        await fetchDeals();
      }
    } catch (err) {
      console.error("Error syncing deals:", err);
    } finally {
      setSyncing(false);
    }
  };

  const setSelectedCategory = useCallback((cat: HardwareCategory) => {
    setSelectedCategoryState(cat);
    setSelectedSubFilter("ALL"); // Reset sub-filter when switching category
  }, []);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const merchants = useMemo(() => {
    const list = Array.from(new Set(deals.map((d) => d.merchant))).filter(Boolean);
    return ["ALL", ...list.sort()];
  }, [deals]);

  const filteredDeals = useMemo(() => {
    const activeSubFilters = SUB_FILTERS[selectedCategory] || [];
    const currentSubFilterObj = activeSubFilters.find((f) => f.id === selectedSubFilter);

    return deals.filter((deal) => {
      // 1. Category check
      if (selectedCategory !== "ALL" && deal.category !== selectedCategory) {
        return false;
      }

      // 2. Sub-filter check (e.g. 512 Go, 1 To, 2 To for SSD)
      if (selectedSubFilter !== "ALL" && currentSubFilterObj) {
        if (!currentSubFilterObj.filter(deal)) {
          return false;
        }
      }

      // 3. Merchant check
      if (selectedMerchant !== "ALL" && deal.merchant !== selectedMerchant) {
        return false;
      }

      // 4. Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const inTitle = deal.title.toLowerCase().includes(q);
        const inMerchant = deal.merchant.toLowerCase().includes(q);
        const inDesc = deal.description?.toLowerCase().includes(q) ?? false;
        if (!inTitle && !inMerchant && !inDesc) {
          return false;
        }
      }

      return true;
    });
  }, [deals, selectedCategory, selectedSubFilter, selectedMerchant, search]);

  return {
    deals: filteredDeals,
    totalCount: deals.length,
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
  };
}
