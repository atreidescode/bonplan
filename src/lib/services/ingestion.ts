import { prisma } from "../db";
import { fetchDealabsHardwareDeals, NormalizedDeal } from "../scrapers/dealabs";
import { fetchTopAchatDeals } from "../scrapers/topachat";
import { fetchMemoryPCDeals } from "../scrapers/memorypc";
import { sendDiscordDealAlert } from "./discord";

export interface SyncReport {
  source: string;
  totalFound: number;
  newDeals: number;
  alertsSent: number;
  errors: string[];
}

const CORE_PING_CATEGORIES = new Set(["CPU", "GPU", "SSD", "MOTHERBOARD"]);

export async function processNormalizedDeals(deals: NormalizedDeal[]): Promise<SyncReport> {
  let newDealsCount = 0;
  let alertsSentCount = 0;
  const errors: string[] = [];

  for (const deal of deals) {
    try {
      const existing = await prisma.deal.findUnique({
        where: { externalId: deal.externalId },
      });

      if (!existing) {
        const created = await prisma.deal.create({
          data: {
            externalId: deal.externalId,
            title: deal.title,
            description: deal.description,
            price: deal.price,
            originalPrice: deal.originalPrice,
            discountPercentage: deal.discountPercentage,
            merchant: deal.merchant,
            source: deal.source,
            url: deal.url,
            imageUrl: deal.imageUrl,
            category: deal.category,
            temperature: deal.temperature,
            discordAlertSent: false,
          },
        });

        newDealsCount++;

        const alertSent = await sendDiscordDealAlert(created);
        if (alertSent) {
          await prisma.deal.update({
            where: { id: created.id },
            data: { discordAlertSent: true },
          });
          alertsSentCount++;
        }
      } else {
        // Deal already exists: check for a significant price drop (>= 5€ and >= 3%)
        const isPriceDrop =
          deal.price > 0 &&
          existing.price > 0 &&
          deal.price <= existing.price - 5 &&
          (existing.price - deal.price) / existing.price >= 0.03;

        // Check if deal just crossed the >= 250° viral threshold on a core component
        const prevTemp = existing.temperature ?? 0;
        const newTemp = deal.temperature ?? prevTemp;
        const crossedHotThreshold =
          CORE_PING_CATEGORIES.has(existing.category) &&
          prevTemp < 250 &&
          newTemp >= 250 &&
          (existing.discountPercentage ?? 0) < 20;

        if (isPriceDrop || newTemp !== prevTemp) {
          const baseOrig = existing.originalPrice || existing.price;
          const updatedDiscount =
            isPriceDrop && baseOrig > deal.price
              ? Math.round(((baseOrig - deal.price) / baseOrig) * 100)
              : existing.discountPercentage;

          const updated = await prisma.deal.update({
            where: { id: existing.id },
            data: {
              price: isPriceDrop ? deal.price : existing.price,
              originalPrice: isPriceDrop ? baseOrig : existing.originalPrice,
              discountPercentage: updatedDiscount,
              temperature: newTemp,
            },
          });

          if (isPriceDrop) {
            const sent = await sendDiscordDealAlert({
              ...updated,
              isPriceDrop: true,
              previousPrice: existing.price,
            });
            if (sent) alertsSentCount++;
          } else if (crossedHotThreshold) {
            const sent = await sendDiscordDealAlert(updated);
            if (sent) alertsSentCount++;
          }
        }
      }
    } catch (err: any) {
      console.error(`Error processing deal "${deal.title}":`, err.message);
      errors.push(err.message);
    }
  }

  return {
    source: deals[0]?.source || "unknown",
    totalFound: deals.length,
    newDeals: newDealsCount,
    alertsSent: alertsSentCount,
    errors,
  };
}

export async function runIngestion(): Promise<SyncReport[]> {
  console.log("⚡ [Ingestion] Starting sync cycle...");
  const reports: SyncReport[] = [];

  try {
    console.log("🔍 [Ingestion] Fetching Dealabs Hardware deals...");
    const dealabsDeals = await fetchDealabsHardwareDeals();
    console.log(`✅ [Ingestion] Found ${dealabsDeals.length} hardware deals on Dealabs.`);
    const dealabsReport = await processNormalizedDeals(dealabsDeals);
    reports.push(dealabsReport);
  } catch (err: any) {
    console.error("❌ [Ingestion] Error with Dealabs:", err.message);
    reports.push({
      source: "dealabs",
      totalFound: 0,
      newDeals: 0,
      alertsSent: 0,
      errors: [err.message],
    });
  }

  try {
    console.log("🔍 [Ingestion] Fetching TopAchat Ventes Flash deals...");
    const topachatDeals = await fetchTopAchatDeals();
    console.log(`✅ [Ingestion] Found ${topachatDeals.length} hardware deals on TopAchat.`);
    const topachatReport = await processNormalizedDeals(topachatDeals);
    reports.push(topachatReport);
  } catch (err: any) {
    console.error("❌ [Ingestion] Error with TopAchat:", err.message);
    reports.push({
      source: "topachat",
      totalFound: 0,
      newDeals: 0,
      alertsSent: 0,
      errors: [err.message],
    });
  }

  try {
    console.log("🔍 [Ingestion] Fetching MemoryPC deals...");
    const memoryPcDeals = await fetchMemoryPCDeals();
    console.log(`✅ [Ingestion] Found ${memoryPcDeals.length} hardware deals on MemoryPC.`);
    const memoryPcReport = await processNormalizedDeals(memoryPcDeals);
    reports.push(memoryPcReport);
  } catch (err: any) {
    console.error("❌ [Ingestion] Error with MemoryPC:", err.message);
    reports.push({
      source: "memorypc",
      totalFound: 0,
      newDeals: 0,
      alertsSent: 0,
      errors: [err.message],
    });
  }

  return reports;
}
