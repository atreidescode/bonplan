export interface HardwareAnalysis {
  /** e.g. "54 €/To" or "2.80 €/Go" */
  unitMetricLabel?: string;
  /** Numeric value of €/To for SSD or €/Go for RAM */
  unitMetricValue?: number;
  /** Whether the unit metric is an exceptional value */
  isGreatUnitMetric?: boolean;
  /** Whether this component hits a known killer target price */
  isTargetPriceHit: boolean;
  /** Reason why target price was hit, e.g. "7800X3D < 340€" or "SSD < 62€/To" */
  targetPriceReason?: string;
}

/**
 * Extracts storage capacity in TB from a deal title (for SSDs).
 * Returns null if no clear capacity is found.
 */
export function extractSsdCapacityTB(title: string): number | null {
  const t = title.toLowerCase();

  // Match e.g. "1 to", "2to", "4 tb", "1.92 to"
  const tbMatch = t.match(/\b(\d+(?:[.,]\d+)?)\s*(?:to|tb)\b/i);
  if (tbMatch) {
    const val = parseFloat(tbMatch[1].replace(",", "."));
    if (val >= 0.25 && val <= 16) return val;
  }

  // Match e.g. "500 go", "512go", "1000 go", "2000 go", "256 go", "480 go"
  const gbMatch = t.match(/\b(240|250|256|480|500|512|960|1000|1024|2000|2048|4000)\s*(?:go|gb)\b/i);
  if (gbMatch) {
    const gb = parseInt(gbMatch[1], 10);
    return gb / 1000;
  }

  return null;
}

/**
 * Extracts RAM total capacity in GB from a deal title.
 */
export function extractRamCapacityGB(title: string): number | null {
  const t = title.toLowerCase();

  // Check kit notation first: "2x16 Go", "2 x 16Go"
  const kitMatch = t.match(/\b([24])\s*x\s*(8|16|24|32|48)\s*(?:go|gb)?\b/i);
  if (kitMatch) {
    return parseInt(kitMatch[1], 10) * parseInt(kitMatch[2], 10);
  }

  // Direct total capacity: "16 Go", "32 Go", "64 Go"
  const totalMatch = t.match(/\b(8|16|24|32|48|64|96|128)\s*(?:go|gb)\b/i);
  if (totalMatch) {
    return parseInt(totalMatch[1], 10);
  }

  return null;
}

export function analyzeHardwareDeal(deal: {
  title: string;
  price: number;
  category: string;
  discountPercentage?: number | null;
  temperature?: number | null;
}): HardwareAnalysis {
  const t = deal.title.toLowerCase();
  const price = deal.price;

  if (!price || price <= 0) {
    return { isTargetPriceHit: false };
  }

  // 1. SSD Analysis (€/To + Target Price)
  if (deal.category === "SSD") {
    const capTB = extractSsdCapacityTB(deal.title);
    if (capTB && capTB > 0) {
      const pricePerTB = Math.round(price / capTB);
      // Sanity check: real SSDs are between 25€/To and 350€/To
      if (pricePerTB >= 25 && pricePerTB <= 350) {
        const isGreatUnitMetric = pricePerTB <= 70;
        const isTargetPriceHit = pricePerTB <= 62;
        return {
          unitMetricLabel: `${pricePerTB} €/To`,
          unitMetricValue: pricePerTB,
          isGreatUnitMetric,
          isTargetPriceHit,
          targetPriceReason: isTargetPriceHit ? `SSD à ${pricePerTB} €/To` : undefined,
        };
      }
    }
    return { isTargetPriceHit: false };
  }

  // 2. RAM Analysis (€/Go + Target Price)
  if (deal.category === "RAM") {
    const capGB = extractRamCapacityGB(deal.title);
    if (capGB && capGB >= 8) {
      const pricePerGB = +(price / capGB).toFixed(2);
      const isDDR5 = t.includes("ddr5");
      const isGreatUnitMetric = isDDR5 ? pricePerGB <= 3.1 : pricePerGB <= 2.1;
      const isTargetPriceHit = isDDR5 ? pricePerGB <= 2.85 : pricePerGB <= 1.85;
      return {
        unitMetricLabel: `${pricePerGB.toFixed(2)} €/Go`,
        unitMetricValue: pricePerGB,
        isGreatUnitMetric,
        isTargetPriceHit,
        targetPriceReason: isTargetPriceHit
          ? `RAM ${isDDR5 ? "DDR5" : "DDR4"} à ${pricePerGB.toFixed(2)} €/Go`
          : undefined,
      };
    }
    return { isTargetPriceHit: false };
  }

  // 3. CPU Target Prices
  if (deal.category === "CPU") {
    if (t.includes("9800x3d") && price <= 450) {
      return { isTargetPriceHit: true, targetPriceReason: `Ryzen 7 9800X3D à ${price}€` };
    }
    if (t.includes("7800x3d") && price <= 340) {
      return { isTargetPriceHit: true, targetPriceReason: `Ryzen 7 7800X3D à ${price}€` };
    }
    if ((t.includes("7500f") || t.includes("7600") || t.includes("9600x")) && price <= 165) {
      return { isTargetPriceHit: true, targetPriceReason: `Ryzen AM5 à ${price}€` };
    }
    if ((t.includes("9950x") || t.includes("7950x3d")) && price <= 490) {
      return { isTargetPriceHit: true, targetPriceReason: `Ryzen 9 à ${price}€` };
    }
    if (t.includes("5700x3d") && price <= 185) {
      return { isTargetPriceHit: true, targetPriceReason: `Ryzen 7 5700X3D à ${price}€` };
    }
    return { isTargetPriceHit: false };
  }

  // 4. GPU Target Prices
  if (deal.category === "GPU") {
    if (t.includes("5080") && price <= 1250) {
      return { isTargetPriceHit: true, targetPriceReason: `RTX 5080 à ${price}€` };
    }
    if (t.includes("5070 ti") && price <= 890) {
      return { isTargetPriceHit: true, targetPriceReason: `RTX 5070 Ti à ${price}€` };
    }
    if (t.includes("9070 xt") && price <= 750) {
      return { isTargetPriceHit: true, targetPriceReason: `RX 9070 XT à ${price}€` };
    }
    if (t.includes("9070") && !t.includes("xt") && price <= 630) {
      return { isTargetPriceHit: true, targetPriceReason: `RX 9070 à ${price}€` };
    }
    if ((t.includes("4070 super") || (t.includes("5070") && !t.includes("ti"))) && price <= 610) {
      return { isTargetPriceHit: true, targetPriceReason: `GPU 70-series à ${price}€` };
    }
    if ((t.includes("4060") || t.includes("7600")) && price >= 150 && price <= 280) {
      return { isTargetPriceHit: true, targetPriceReason: `GPU 1080p à ${price}€` };
    }
    return { isTargetPriceHit: false };
  }

  // 5. Motherboard Target Prices
  if (deal.category === "MOTHERBOARD") {
    if ((t.includes("b650") || t.includes("b850")) && price <= 130) {
      return { isTargetPriceHit: true, targetPriceReason: `Carte Mère AM5 B650/B850 à ${price}€` };
    }
    if ((t.includes("x670") || t.includes("x870")) && price <= 230) {
      return { isTargetPriceHit: true, targetPriceReason: `Carte Mère X670/X870 à ${price}€` };
    }
    return { isTargetPriceHit: false };
  }

  return { isTargetPriceHit: false };
}
