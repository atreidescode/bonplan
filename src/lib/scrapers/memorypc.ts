import * as cheerio from "cheerio";
import { categorizeDeal, HardwareCategory } from "../services/categorizer";
import { NormalizedDeal } from "./dealabs";

const MEMORYPC_URLS: Array<{ url: string; fallbackCategory: HardwareCategory }> = [
  { url: "https://www.memorypc.fr/super-soldes/", fallbackCategory: "PC_DESKTOP" },
  { url: "https://www.memorypc.fr/kit-d-evolution-pc/", fallbackCategory: "CPU" },
  { url: "https://www.memorypc.fr/pc-gamer/", fallbackCategory: "PC_DESKTOP" },
];

function parseFrenchPrice(raw: string): number {
  if (!raw) return 0;
  // Match first price pattern like "1 410,76" or "886,39"
  const match = raw.match(/(\d[\d\s\u202f\u00a0]*[.,]\d{2})/);
  if (!match) return 0;
  const cleaned = match[1].replace(/[\s\u202f\u00a0]/g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

export async function fetchMemoryPCDeals(): Promise<NormalizedDeal[]> {
  const dealsMap = new Map<string, NormalizedDeal>();

  const results = await Promise.all(
    MEMORYPC_URLS.map((entry) =>
      scrapeMemoryPCPage(entry.url, entry.fallbackCategory).catch((err) => {
        console.error(`[MemoryPC] Error scraping ${entry.url}:`, err.message);
        return [] as NormalizedDeal[];
      })
    )
  );

  for (const list of results) {
    for (const d of list) {
      if (!dealsMap.has(d.externalId)) {
        dealsMap.set(d.externalId, d);
      }
    }
  }

  return Array.from(dealsMap.values());
}

async function scrapeMemoryPCPage(
  pageUrl: string,
  fallbackCategory: HardwareCategory
): Promise<NormalizedDeal[]> {
  const res = await fetch(pageUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!res.ok) return [];

  const html = await res.text();
  const $ = cheerio.load(html);
  const deals: NormalizedDeal[] = [];

  $(".product-box").each((_, el) => {
    try {
      const $el = $(el);
      const nameEl = $el.find(".product-name").first();
      const title = nameEl.text().trim();
      const href = nameEl.attr("href") || "";
      if (!title || !href) return;

      const fullUrl = href.startsWith("http") ? href : `https://www.memorypc.fr${href}`;

      // Extract ID from URL or data-product-information
      const idMatch = fullUrl.match(/-(\d+)\/?$/);
      const externalId = idMatch
        ? `memorypc-${idMatch[1]}`
        : `memorypc-${Buffer.from(fullUrl).toString("base64").slice(0, 16)}`;

      const listPriceText = $el.find(".list-price-price").first().text().trim();
      const priceClone = $el.find(".product-price").first().clone();
      priceClone.find(".list-price, .list-price-price").remove();
      const currentPriceText = priceClone.text().trim();

      const price = parseFrenchPrice(currentPriceText);
      const originalPrice = parseFrenchPrice(listPriceText);

      // Only include MemoryPC items that are genuinely on sale (discounted)
      if (price <= 0 || !originalPrice || originalPrice <= price) {
        return;
      }

      const discountPercentage = Math.round(((originalPrice - price) / originalPrice) * 100);
      if (discountPercentage < 4) return;

      const imageUrl =
        $el.find("img.product-image").attr("src") || $el.find("img").first().attr("src");

      const catResult = categorizeDeal(title);
      const category = catResult.isHardware ? catResult.category : fallbackCategory;

      deals.push({
        externalId,
        title,
        description: `Offre MemoryPC (-${discountPercentage}%)`,
        price,
        originalPrice,
        discountPercentage,
        merchant: "MemoryPC",
        source: "memorypc",
        url: fullUrl,
        imageUrl,
        category,
      });
    } catch {
      // ignore item error
    }
  });

  return deals;
}
