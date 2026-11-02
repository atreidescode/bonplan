import { HardwareCategory, Deal } from "@/types/deal";

export interface SubFilterOption {
  id: string;
  label: string;
  filter: (deal: Deal) => boolean;
}

export const SUB_FILTERS: Partial<Record<HardwareCategory, SubFilterOption[]>> = {
  SSD: [
    { id: "ALL", label: "Tous les SSD", filter: () => true },
    {
      id: "500GB",
      label: "500 Go / 512 Go",
      filter: (d) => /\b(500\s*(?:go|gb)|512\s*(?:go|gb))\b/i.test(`${d.title} ${d.description || ""}`),
    },
    {
      id: "1TB",
      label: "1 To",
      filter: (d) => /\b(1\s*(?:to|tb)|1000\s*(?:go|gb))\b/i.test(`${d.title} ${d.description || ""}`),
    },
    {
      id: "2TB",
      label: "2 To",
      filter: (d) => /\b(2\s*(?:to|tb)|2000\s*(?:go|gb))\b/i.test(`${d.title} ${d.description || ""}`),
    },
    {
      id: "4TB",
      label: "4 To+",
      filter: (d) => /\b([4-8]\s*(?:to|tb))\b/i.test(`${d.title} ${d.description || ""}`),
    },
    {
      id: "SAMSUNG",
      label: "Samsung 990 / 980",
      filter: (d) => /\bsamsung\b/i.test(`${d.title} ${d.description || ""}`),
    },
    {
      id: "CRUCIAL",
      label: "Crucial T500 / P3",
      filter: (d) => /\bcrucial\b/i.test(`${d.title} ${d.description || ""}`),
    },
    {
      id: "WD",
      label: "WD Black / Blue",
      filter: (d) => /\b(?:wd|western\s*digital|sn\d{3})\b/i.test(`${d.title} ${d.description || ""}`),
    },
  ],

  GPU: [
    { id: "ALL", label: "Toutes les cartes", filter: () => true },
    {
      id: "NVIDIA",
      label: "NVIDIA GeForce",
      filter: (d) => /\b(nvidia|geforce|rtx)\b/i.test(`${d.title} ${d.description || ""}`),
    },
    {
      id: "AMD",
      label: "AMD Radeon",
      filter: (d) => /\b(amd|radeon|rx\s*\d{4})\b/i.test(`${d.title} ${d.description || ""}`),
    },
    {
      id: "RTX_50",
      label: "Série RTX 50 (5080 / 5090)",
      filter: (d) => /\b(5070|5080|5090)\b/i.test(d.title),
    },
    {
      id: "RTX_4070_PLUS",
      label: "RTX 4070 / 4080 / 4090",
      filter: (d) => /\b(4070|4080|4090)\b/i.test(d.title),
    },
    {
      id: "RTX_4060",
      label: "RTX 4060 / 4060 Ti",
      filter: (d) => /\b4060\b/i.test(d.title),
    },
    {
      id: "RX_7000",
      label: "Radeon RX 7000 / 9000",
      filter: (d) => /\brx\s*[79]\d{3}\b/i.test(d.title),
    },
  ],

  CPU: [
    { id: "ALL", label: "Tous les CPU", filter: () => true },
    {
      id: "RYZEN",
      label: "AMD Ryzen",
      filter: (d) => /\bryzen\b/i.test(`${d.title} ${d.description || ""}`),
    },
    {
      id: "INTEL",
      label: "Intel Core",
      filter: (d) => /\b(intel|core\s*i\d|ultra)\b/i.test(`${d.title} ${d.description || ""}`),
    },
    {
      id: "AM5",
      label: "Socket AM5",
      filter: (d) => /\b(am5|7600|7700|7800x3d|7900|7950|9600|9700|9800x3d|9900|9950)\b/i.test(d.title),
    },
    {
      id: "X3D",
      label: "Gaming X3D",
      filter: (d) => /\bx3d\b/i.test(d.title),
    },
  ],

  RAM: [
    { id: "ALL", label: "Toute la RAM", filter: () => true },
    {
      id: "DDR5",
      label: "DDR5",
      filter: (d) => /\bddr5\b/i.test(`${d.title} ${d.description || ""}`),
    },
    {
      id: "DDR4",
      label: "DDR4",
      filter: (d) => /\bddr4\b/i.test(`${d.title} ${d.description || ""}`),
    },
    {
      id: "32GB",
      label: "32 Go (2x16)",
      filter: (d) => /\b(32\s*(?:go|gb)|2\s*x\s*16)\b/i.test(`${d.title} ${d.description || ""}`),
    },
    {
      id: "16GB",
      label: "16 Go (2x8)",
      filter: (d) => /\b(16\s*(?:go|gb)|2\s*x\s*8)\b/i.test(`${d.title} ${d.description || ""}`),
    },
    {
      id: "64GB",
      label: "64 Go+",
      filter: (d) => /\b(64\s*(?:go|gb)|2\s*x\s*32)\b/i.test(`${d.title} ${d.description || ""}`),
    },
  ],

  MONITOR: [
    { id: "ALL", label: "Tous les écrans", filter: () => true },
    {
      id: "OLED",
      label: "OLED / QD-OLED",
      filter: (d) => /\b(oled|qd-oled)\b/i.test(`${d.title} ${d.description || ""}`),
    },
    {
      id: "1440P",
      label: "1440p / QHD / 2K",
      filter: (d) => /\b(1440p|qhd|2k|wqhd)\b/i.test(`${d.title} ${d.description || ""}`),
    },
    {
      id: "4K",
      label: "4K UHD",
      filter: (d) => /\b(4k|uhd|2160p)\b/i.test(`${d.title} ${d.description || ""}`),
    },
    {
      id: "HIGH_REFRESH",
      label: "240Hz+",
      filter: (d) => /\b(240\s*hz|280\s*hz|360\s*hz|500\s*hz)\b/i.test(`${d.title} ${d.description || ""}`),
    },
  ],

  COOLING: [
    { id: "ALL", label: "Tout le refroidissement", filter: () => true },
    {
      id: "AIO",
      label: "Watercooling AIO",
      filter: (d) => /\b(watercooling|aio|kraken|liquid\s*freezer)\b/i.test(`${d.title} ${d.description || ""}`),
    },
    {
      id: "VENTIRAD",
      label: "Ventirad Air",
      filter: (d) => /\b(ventirad|peerless|phantom|noctua)\b/i.test(`${d.title} ${d.description || ""}`),
    },
    {
      id: "THERMALRIGHT",
      label: "Thermalright",
      filter: (d) => /\bthermalright\b/i.test(`${d.title} ${d.description || ""}`),
    },
  ],

  MOTHERBOARD: [
    { id: "ALL", label: "Toutes les cartes mères", filter: () => true },
    {
      id: "AM5",
      label: "AMD AM5 (B650 / X670 / X870)",
      filter: (d) => /\b(am5|b650|x670|x870)\b/i.test(`${d.title} ${d.description || ""}`),
    },
    {
      id: "INTEL",
      label: "Intel LGA1700 (B760 / Z790)",
      filter: (d) => /\b(lga1700|b760|z790|z890)\b/i.test(`${d.title} ${d.description || ""}`),
    },
  ],

  CASE: [
    { id: "ALL", label: "Tous les boîtiers", filter: () => true },
    {
      id: "MOYEN_TOUR",
      label: "Moyen Tour",
      filter: (d) => /\bmoyen\s*tour\b/i.test(`${d.title} ${d.description || ""}`),
    },
    {
      id: "GRAND_TOUR",
      label: "Grand Tour",
      filter: (d) => /\bgrand\s*tour\b/i.test(`${d.title} ${d.description || ""}`),
    },
    {
      id: "COMPACT",
      label: "Mini-ITX / Compact",
      filter: (d) => /\b(mini[- ]?itx|compact)\b/i.test(`${d.title} ${d.description || ""}`),
    },
  ],

  PSU: [
    { id: "ALL", label: "Toutes les alims", filter: () => true },
    {
      id: "850W_PLUS",
      label: "850W+",
      filter: (d) => /\b(850|1000|1200)\s*w\b/i.test(`${d.title} ${d.description || ""}`),
    },
    {
      id: "750W",
      label: "750W",
      filter: (d) => /\b750\s*w\b/i.test(`${d.title} ${d.description || ""}`),
    },
    {
      id: "GOLD",
      label: "80+ Gold / Platinum",
      filter: (d) => /\b(gold|platinum)\b/i.test(`${d.title} ${d.description || ""}`),
    },
  ],

  PC_DESKTOP: [
    { id: "ALL", label: "Tous les PC fixes", filter: () => true },
    { id: "UNDER_1000", label: "< 1000 €", filter: (d) => d.price > 0 && d.price < 1000 },
    { id: "1000_1500", label: "1000 € - 1500 €", filter: (d) => d.price >= 1000 && d.price <= 1500 },
    { id: "OVER_1500", label: "> 1500 €", filter: (d) => d.price > 1500 },
  ],

  LAPTOP_GAMING: [
    { id: "ALL", label: "Tous les portables", filter: () => true },
    { id: "UNDER_1000", label: "< 1000 €", filter: (d) => d.price > 0 && d.price < 1000 },
    { id: "1000_1500", label: "1000 € - 1500 €", filter: (d) => d.price >= 1000 && d.price <= 1500 },
    { id: "OVER_1500", label: "> 1500 €", filter: (d) => d.price > 1500 },
  ],

  PERIPHERAL: [
    { id: "ALL", label: "Tous les périphériques", filter: () => true },
    {
      id: "SOURIS",
      label: "Souris",
      filter: (d) => /\bsouris\b/i.test(`${d.title} ${d.description || ""}`),
    },
    {
      id: "CLAVIER",
      label: "Clavier",
      filter: (d) => /\bclavier\b/i.test(`${d.title} ${d.description || ""}`),
    },
    {
      id: "CASQUE",
      label: "Casque Audio",
      filter: (d) => /\bcasque\b/i.test(`${d.title} ${d.description || ""}`),
    },
  ],
};
