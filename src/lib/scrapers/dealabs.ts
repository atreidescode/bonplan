import { XMLParser } from "fast-xml-parser";
import * as cheerio from "cheerio";
import { categorizeDeal, HardwareCategory } from "../services/categorizer";

export interface NormalizedDeal {
  externalId: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  merchant: string;
  source: string;
  url: string;
  imageUrl?: string;
  category: HardwareCategory;
  temperature?: number;
}

const HARDWARE_TARGET_QUERIES = [
  "carte graphique",
  "carte graphique rtx",
  "carte graphique rx",
  "ssd nvme",
  "ssd 1to",
  "ssd 2to",
  "barrette ram",
  "ddr5 ram",
  "processeur ryzen",
  "processeur intel",
  "carte mere am5",
  "ventirad",
  "watercooling",
  "alimentation pc",
  "ecran pc gamer",
  "pc fixe gamer",
  "pc portable gamer",
];

export async function fetchDealabsHardwareDeals(): Promise<NormalizedDeal[]> {
  const dealsMap = new Map<string, NormalizedDeal>();

  // 1. Fetch latest RSS
  try {
    const rssDeals = await fetchDealabsRSS();
    for (const d of rssDeals) {
      dealsMap.set(d.externalId, d);
    }
  } catch (err: any) {
    console.error("[Dealabs] Error fetching RSS:", err.message);
  }

  // 2. Fetch targeted Hardware searches with hide_expired=1
  for (const query of HARDWARE_TARGET_QUERIES) {
    try {
      const searchDeals = await fetchDealabsSearchByQuery(query);
      for (const d of searchDeals) {
        if (!dealsMap.has(d.externalId)) {
          dealsMap.set(d.externalId, d);
        }
      }
    } catch (err: any) {
      console.error(`[Dealabs] Error querying "${query}":`, err.message);
    }
  }

  return Array.from(dealsMap.values());
}

async function fetchDealabsRSS(): Promise<NormalizedDeal[]> {
  const url = "https://www.dealabs.com/rss/groupe/informatique";

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Accept: "application/rss+xml, application/xml, text/xml",
    },
  });

  if (!response.ok) return [];

  const xmlText = await response.text();
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
  const parsed = parser.parse(xmlText);
  const items = parsed?.rss?.channel?.item;

  if (!items || !Array.isArray(items)) return [];

  const deals: NormalizedDeal[] = [];

  for (const item of items) {
    const title = item.title || "";
    if (title.toLowerCase().includes("[expiré]") || title.toLowerCase().includes("[expire]")) {
      continue;
    }
    const description = typeof item.description === "string" ? item.description : "";
    const link = item.link || item.guid || "";

    const idMatch = link.match(/-(\d+)(?:\?|$)/);
    const externalId = idMatch ? `dealabs-${idMatch[1]}` : `dealabs-${Buffer.from(link).toString("base64").slice(0, 16)}`;

    const merchantData = item["pepper:merchant"] || {};
    const merchantName = merchantData["@_name"] || "Marchand inconnu";
    const rawPrice = merchantData["@_price"] || "";
    let price = 0;
    if (rawPrice) {
      const cleaned = String(rawPrice).replace(/[^\d.,]/g, "").replace(",", ".");
      price = parseFloat(cleaned) || 0;
    }

    let imageUrl: string | undefined = undefined;
    if (item.enclosure && item.enclosure["@_url"]) {
      imageUrl = item.enclosure["@_url"];
    } else if (item["media:content"] && item["media:content"]["@_url"]) {
      imageUrl = item["media:content"]["@_url"];
    }

    const cleanDescription = description.replace(/<[^>]*>?/gm, "").trim();

    const categoryResult = categorizeDeal(title, cleanDescription);
    if (categoryResult.isHardware) {
      deals.push({
        externalId,
        title: title.trim(),
        description: cleanDescription.slice(0, 500),
        price,
        merchant: merchantName,
        source: "dealabs",
        url: link,
        imageUrl,
        category: categoryResult.category,
      });
    }
  }

  return deals;
}

async function fetchDealabsSearchByQuery(query: string): Promise<NormalizedDeal[]> {
  const url = `https://www.dealabs.com/search?q=${encodeURIComponent(query)}&hide_expired=1`;
  const res = await fetch(url, {
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

  $("[data-vue3]").each((_, el) => {
    const raw = $(el).attr("data-vue3");
    if (!raw || !raw.includes("ThreadMainListItemNormalizer")) return;

    try {
      const parsed = JSON.parse(raw);
      const t = parsed?.props?.thread;
      if (!t || !t.threadId) return;

      // ❌ IGNORE EXPIRED DEALS COMPLETELY!
      if (t.isExpired === true || t.status === "Expired") {
        return;
      }

      const title = t.title || "";
      if (title.toLowerCase().includes("[expiré]") || title.toLowerCase().includes("[expire]")) {
        return;
      }
      const price = typeof t.price === "number" ? t.price : 0;
      const originalPrice =
        typeof t.nextBestPrice === "number" && t.nextBestPrice > price ? t.nextBestPrice : undefined;

      const discountPercentage =
        originalPrice && originalPrice > price
          ? Math.round(((originalPrice - price) / originalPrice) * 100)
          : undefined;

      const merchantName = t.merchant?.merchantName || "Marchand inconnu";
      const dealUrl = `https://www.dealabs.com/bons-plans/${t.titleSlug || "deal"}-${t.threadId}`;

      let imageUrl: string | undefined = undefined;
      if (t.mainImage && t.mainImage.path && t.mainImage.name) {
        imageUrl = `https://static-pepper.dealabs.com/${t.mainImage.path}/${t.mainImage.name}/re/300x300/qt/60/${t.mainImage.name}.${t.mainImage.ext || "jpg"}`;
      }

      const catResult = categorizeDeal(title);
      if (catResult.isHardware) {
        deals.push({
          externalId: `dealabs-${t.threadId}`,
          title,
          description: `Score Dealabs : ${Math.round(t.temperature || 0)}°`,
          price,
          originalPrice,
          discountPercentage,
          merchant: merchantName,
          source: "dealabs",
          url: dealUrl,
          imageUrl,
          category: catResult.category,
          temperature: Math.round(t.temperature || 0),
        });
      }
    } catch {
      // ignore parsing error
    }
  });

  return deals;
}
