import * as cheerio from "cheerio";
import { categorizeDeal } from "../services/categorizer";
import { NormalizedDeal } from "./dealabs";

function extractDiscountFromText(text: string): number | undefined {
  const match = text.match(/-\s*(\d{1,2})\s*%/);
  if (match) {
    const val = parseInt(match[1], 10);
    if (val > 0 && val <= 95) return val;
  }
  return undefined;
}

export async function fetchTopAchatDeals(): Promise<NormalizedDeal[]> {
  const url = "https://www.topachat.com/pages/ventes-flash.php";

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`TopAchat responded with status ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const deals: NormalizedDeal[] = [];

  $("a.vfl__item").each((_, el) => {
    try {
      const $el = $(el);
      const href = $el.attr("href") || "";
      if (!href) return;

      const fullUrl = href.startsWith("http") ? href : `https://www.topachat.com${href}`;

      // Extract SKU / Reference ID from URL, e.g. ref_est_in20033139
      const refMatch = href.match(/ref_est_([a-zA-Z0-9]+)/);
      const externalId = refMatch ? `topachat-${refMatch[1]}` : `topachat-${Buffer.from(href).toString("base64").slice(0, 16)}`;

      // Title & description
      const promoHeader = $el.find("h3.vfl__promo").text().trim();
      const secondaryDesc = $el.find(".vfl__details-secondary small").text().trim();
      const fullTitle = secondaryDesc || promoHeader;

      // Image
      const imageUrl = $el.find("img").attr("src");

      // Price extraction
      const currentPriceText = $el.find(".price, strong.price").first().text().trim();
      const currentPrice = parseFloat(currentPriceText.replace(/[^0-9,.]/g, "").replace(",", "."));

      if (isNaN(currentPrice) || currentPrice <= 0) return;

      // Original price extraction: "au lieu de 1569.99 €"
      let originalPrice: number | undefined = undefined;
      const detailsText = $el.find(".vfl_details").text();
      const origMatch = detailsText.match(/au lieu de\s*([\d\s]+(?:[.,]\d{2})?)\s*€/i);
      if (origMatch) {
        const parsedOrig = parseFloat(origMatch[1].replace(/\s/g, "").replace(",", "."));
        if (!isNaN(parsedOrig) && parsedOrig > currentPrice) {
          originalPrice = parsedOrig;
        }
      }

      const discountPercentage =
        originalPrice && originalPrice > currentPrice
          ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
          : extractDiscountFromText(`${promoHeader} ${fullTitle}`);

      // Categorize
      const categoryResult = categorizeDeal(fullTitle, `${promoHeader} ${detailsText}`);

      if (categoryResult.isHardware) {
        deals.push({
          externalId,
          title: fullTitle,
          description: promoHeader,
          price: currentPrice,
          originalPrice,
          discountPercentage,
          merchant: "TopAchat",
          source: "topachat",
          url: fullUrl,
          imageUrl: imageUrl ? (imageUrl.startsWith("http") ? imageUrl : `https:${imageUrl}`) : undefined,
          category: categoryResult.category,
        });
      }
    } catch {
      // Skip problematic item
    }
  });

  return deals;
}
