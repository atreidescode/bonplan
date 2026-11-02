import { prisma } from "../db";
import { fetchDealabsHardwareDeals, NormalizedDeal } from "../scrapers/dealabs";
import { fetchTopAchatDeals } from "../scrapers/topachat";
import { sendDiscordDealAlert } from "./discord";

export interface SyncReport {
  source: string;
  totalFound: number;
  newDeals: number;
  alertsSent: number;
  errors: string[];
}

export async function processNormalizedDeals(deals: NormalizedDeal[]): Promise<SyncReport> {
  let newDealsCount = 0;
  let alertsSentCount = 0;
  const errors: string[] = [];

  for (const deal of deals) {
    try {
      // Check if deal already exists
      const existing = await prisma.deal.findUnique({
        where: { externalId: deal.externalId },
      });

      if (!existing) {
        // Create deal in DB
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

        // Send Discord notification
        const alertSent = await sendDiscordDealAlert(created);
        if (alertSent) {
          await prisma.deal.update({
            where: { id: created.id },
            data: { discordAlertSent: true },
          });
          alertsSentCount++;
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

  return reports;
}
