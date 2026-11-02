import { Deal } from "@prisma/client";

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
  PERIPHERAL: 0x84cc16, // Lime
  OTHER: 0x94a3b8, // Light Gray
};

export async function sendDiscordDealAlert(deal: {
  title: string;
  price: number;
  originalPrice?: number | null;
  discountPercentage?: number | null;
  merchant: string;
  source: string;
  url: string;
  imageUrl?: string | null;
  category: string;
}): Promise<boolean> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl || webhookUrl.trim() === "" || webhookUrl.includes("REPLACE_ME")) {
    console.log(`[Discord] Webhook URL not set. Skipping alert for: "${deal.title}"`);
    return false;
  }

  const color = CATEGORY_COLORS[deal.category] || 0x2563eb;

  const formattedPrice = deal.price > 0 ? `${deal.price.toFixed(2)} €` : "Voir l'offre";
  const oldPrice =
    deal.originalPrice && deal.originalPrice > deal.price
      ? `~~${deal.originalPrice.toFixed(2)} €~~`
      : "";

  const discountText =
    deal.discountPercentage && deal.discountPercentage > 0
      ? ` (-${Math.round(deal.discountPercentage)}%)`
      : "";

  const embed = {
    title: `[${deal.category}] ${deal.title}`.slice(0, 250),
    url: deal.url,
    color,
    description: `🔥 **Nouveau bon plan détecté !**`,
    fields: [
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
        value: deal.category,
        inline: true,
      },
    ],
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

      console.log(`[Discord] Alert sent successfully for: "${deal.title}"`);
      // Small pause between webhooks to stay under Discord rate limits
      await new Promise((resolve) => setTimeout(resolve, 350));
      return true;
    }

    return false;
  } catch (error) {
    console.error("[Discord] Webhook send error:", error);
    return false;
  }
}
