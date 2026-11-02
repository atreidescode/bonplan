export type HardwareCategory =
  | "ALL"
  | "GPU"
  | "CPU"
  | "RAM"
  | "SSD"
  | "MONITOR"
  | "MOTHERBOARD"
  | "PSU"
  | "COOLING"
  | "CASE"
  | "PC_DESKTOP"
  | "LAPTOP_GAMING"
  | "PERIPHERAL"
  | "OTHER";

export interface Deal {
  id: string;
  externalId: string;
  title: string;
  description: string | null;
  price: number;
  originalPrice: number | null;
  discountPercentage: number | null;
  merchant: string;
  source: string;
  url: string;
  imageUrl: string | null;
  category: HardwareCategory;
  temperature: number | null;
  createdAt: string;
}

export interface CategoryInfo {
  id: HardwareCategory;
  label: string;
  shortLabel: string;
}
