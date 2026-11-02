import { analyzeHardwareDeal } from "./hardwareAnalyzer";

const CATEGORY_COLORS: Record<string, number> = {
  GPU: 0x10b981, // Emerald Green (Nvidia / Radeon)
  CPU: 0x3b82f6, // Blue (Intel / AMD)
  RAM: 0xa855f7, // Purple
  SSD: 0xf59e0b, // Amber / Gold
  MOTHERBOARD: 0x6366f1, // Indigo
  PSU: 0xec4899, // Pink
  COOLING: 0x06b6d4, // Cyan
  CASE: 0x64748b, // Slate
  MONITOR: 0xf97316, // Orange
  PC_DESKTOP: 0x8b5cf6, // Violet
  LAPTOP_GAMING: 0xe11d48, // Rose
  PERIPHERAL: 0x84cc16, // Lime
  OTHER: 0x94a3b8, // Light Gray
};

const PING_EVERYONE_CATEGORIES = new Set(["CPU", "GPU", "SSD", "MOTHERBOARD"]);

const CATEGORY_LABELS_FR: Record<string, string> = {
  CPU: "Processeur",
  GPU: "Carte Graphique",
  SSD: "SSD NVMe / SATA",
  MOTHERBOARD: "Carte Mère",
  RAM: "Mémoire RAM",
  PSU: "Alimentation",
  COOLING: "Refroidissement",
  CASE: "Boîtier PC",
  MONITOR: "Écran PC",
  PC_DESKTOP: "PC Fixe Gamer",
  LAPTOP_GAMING: "PC Portable Gamer",
  PERIPHERAL: "Périphérique",
};

export async function sendDiscordDealAlert(deal: {
  title: string;
  price: number;
  originalPrice?: number | null;
  discountPercentage?: number | null;
  temperature?: number | null;
  merchant: string;
  source: string;
  url: string;
  imageUrl?: string | null;
  category: string;
  isPriceDrop?: boolean;
  previousPrice?: number;
}): Promise<boolean> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl || webhookUrl.trim() === "" || webhookUrl.includes("REPLACE_ME")) {
    console.log(`[Discord] Webhook URL not set. Skipping alert for: "${deal.title}"`);
    return false;
  }

  const color = CATEGORY_COLORS[deal.category] || 0x6d3c52;
  const categoryLabel = CATEGORY_LABELS_FR[deal.category] || deal.category;

  const formattedPrice = deal.price > 0 ? `${deal.price.toFixed(2)} €` : "Voir l'offre";
  const oldPrice =
    deal.originalPrice && deal.originalPrice > deal.price
      ? `~~${deal.originalPrice.toFixed(2)} €~~`
      : "";

  const discountVal =
    typeof deal.discountPercentage === "number" ? Math.round(deal.discountPercentage) : 0;
  const tempVal = typeof deal.temperature === "number" ? Math.round(deal.temperature) : 0;

  const discountText = discountVal > 0 ? ` (-${discountVal}%)` : "";

  const analysis = analyzeHardwareDeal(deal);

  // Trigger @everyone on CPU / GPU / SSD / MOTHERBOARD if:
  // 1) Discount >= 20% OR
  // 2) Dealabs Temperature >= 250° OR
  // 3) Target Price hit (e.g. 7800X3D < 340€, SSD < 62€/To, etc.)
  const isCoreComponent = PING_EVERYONE_CATEGORIES.has(deal.category);
  const hasHighDiscount = discountVal >= 20;
  const hasHotTemp = tempVal >= 250;
  const hasTargetPrice = analysis.isTargetPriceHit;

  const shouldPingEveryone = isCoreComponent && (hasHighDiscount || hasHotTemp || hasTargetPrice);

  let contentMessage: string | undefined = undefined;
  if (shouldPingEveryone) {
    const reasons: string[] = [];
    if (hasHighDiscount) reasons.push(`-${discountVal}%`);
    if (hasHotTemp) reasons.push(`🔥 ${tempVal}° sur Dealabs`);
    if (hasTargetPrice && analysis.targetPriceReason) reasons.push(`🎯 ${analysis.targetPriceReason}`);

    contentMessage = `@everyone 🚨 **ALERTE PÉPITE ${categoryLabel.toUpperCase()} (${reasons.join(" • ")}) !**`;
  } else if (deal.isPriceDrop && deal.previousPrice) {
    const diff = (deal.previousPrice - deal.price).toFixed(2);
    contentMessage = `📉 **NOUVELLE BAISSE DE PRIX (-${diff} €)** sur **${categoryLabel}** !`;
  }

  const fields: Array<{ name: string; value: string; inline: boolean }> = [
    {
      name: "💰 Prix",
      value: `${formattedPrice} ${oldPrice} ${discountText}`.trim(),
      inline: true,
    },
    {
      name: "🛒 Marchand",
      value: deal.merchant || "Non spécifié",
      inline: true,
    },
    {
      name: "🏷️ Catégorie",
      value: categoryLabel,
      inline: true,
    },
  ];

  if (analysis.unitMetricLabel) {
    fields.push({
      name: "⚡ Ratio Qualité/Prix",
      value: analysis.isGreatUnitMetric
        ? `🔥 **${analysis.unitMetricLabel}** (Excellent)`
        : analysis.unitMetricLabel,
      inline: true,
    });
  }

  if (tempVal !== 0) {
    fields.push({
      name: "🌡️ Température",
      value: tempVal >= 250 ? `🔥 **${tempVal}°** (Brûlant)` : `${tempVal}°`,
      inline: true,
    });
  }

  if (deal.isPriceDrop && deal.previousPrice) {
    fields.push({
      name: "📉 Évolution",
      value: `Ancien prix : ~~${deal.previousPrice.toFixed(2)} €~~ → **${deal.price.toFixed(2)} €**`,
      inline: false,
    });
  }

  const embed = {
    title: `[${deal.category}] ${deal.title}`.slice(0, 250),
    url: deal.url,
    color,
    description: shouldPingEveryone
      ? `💥 **Pépite détectée sur ${categoryLabel} !**`
      : deal.isPriceDrop
        ? `📉 **Ce produit vient de baisser de prix !**`
        : `🔥 **Nouveau bon plan détecté !**`,
    fields,
    image: deal.imageUrl ? { url: deal.imageUrl } : undefined,
    footer: {
      text: `BonPlan Hardware • Source: ${deal.source.toUpperCase()}`,
    },
    timestamp: new Date().toISOString(),
  };

  try {
    let attempts = 0;
    while (attempts < 3) {
      attempts++;
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "BonPlan Hardware Bot",
          avatar_url: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=128&q=80",
          content: contentMessage,
          allowed_mentions: shouldPingEveryone ? { parse: ["everyone"] } : { parse: [] },
          embeds: [embed],
        }),
      });

      if (res.status === 429) {
        const body: any = await res.json().catch(() => ({}));
        const retryAfterSec = body.retry_after || 2;
        console.warn(`[Discord] Rate limited (429). Waiting ${retryAfterSec}s before retrying...`);
        await new Promise((resolve) => setTimeout(resolve, Math.ceil(retryAfterSec * 1000) + 100));
        continue;
      }

      if (!res.ok) {
        console.error(`[Discord] Error sending webhook: ${res.status} ${res.statusText}`);
        return false;
      }

      console.log(
        `[Discord] Alert sent${shouldPingEveryone ? " (WITH @everyone)" : ""} for: "${deal.title}"`
      );
      await new Promise((resolve) => setTimeout(resolve, 350));
      return true;
    }

    return false;
  } catch (error) {
    console.error("[Discord] Webhook send error:", error);
    return false;
  }
}
