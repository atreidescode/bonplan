import { HardwareCategory } from "@/types/deal";
import {
  Layers,
  Zap,
  Cpu,
  CircuitBoard,
  HardDrive,
  Tv,
  Box,
  Fan,
  Headphones,
  Laptop,
  Server,
  type LucideIcon,
} from "lucide-react";

export interface CategoryItem {
  id: HardwareCategory;
  label: string;
  icon: LucideIcon;
}

export const CATEGORIES: CategoryItem[] = [
  { id: "ALL", label: "Tous les deals", icon: Layers },
  { id: "GPU", label: "Cartes Graphiques", icon: Zap },
  { id: "CPU", label: "Processeurs", icon: Cpu },
  { id: "RAM", label: "Mémoire RAM", icon: CircuitBoard },
  { id: "SSD", label: "SSD NVMe", icon: HardDrive },
  { id: "MOTHERBOARD", label: "Cartes Mères", icon: CircuitBoard },
  { id: "COOLING", label: "Refroidissement", icon: Fan },
  { id: "PSU", label: "Alimentations", icon: Zap },
  { id: "CASE", label: "Boîtiers", icon: Box },
  { id: "MONITOR", label: "Écrans", icon: Tv },
  { id: "PC_DESKTOP", label: "PC Fixes & Gamer", icon: Server },
  { id: "LAPTOP_GAMING", label: "PC Portables", icon: Laptop },
  { id: "PERIPHERAL", label: "Périphériques", icon: Headphones },
];

// Aesthetic Sakura-inspired badge styling
export const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  GPU: { bg: "bg-[#6D3C52]/30", text: "text-[#FADCD5]", border: "border-[#6D3C52]/60" },
  CPU: { bg: "bg-[#4B2138]/60", text: "text-[#FADCD5]", border: "border-[#6D3C52]/50" },
  RAM: { bg: "bg-[#4B2138]/40", text: "text-[#FADCD5]", border: "border-[#4B2138]" },
  SSD: { bg: "bg-[#6D3C52]/25", text: "text-[#FADCD5]", border: "border-[#6D3C52]/50" },
  MOTHERBOARD: { bg: "bg-[#2D222F]", text: "text-[#E8BFB6]", border: "border-[#4B2138]" },
  COOLING: { bg: "bg-[#4B2138]/30", text: "text-[#FADCD5]", border: "border-[#4B2138]" },
  PSU: { bg: "bg-[#6D3C52]/20", text: "text-[#FADCD5]", border: "border-[#6D3C52]/40" },
  CASE: { bg: "bg-[#2D222F]", text: "text-[#A88D99]", border: "border-[#4B2138]" },
  MONITOR: { bg: "bg-[#6D3C52]/30", text: "text-[#FADCD5]", border: "border-[#6D3C52]/50" },
  PC_DESKTOP: { bg: "bg-[#6D3C52]/40", text: "text-[#FADCD5]", border: "border-[#854763]" },
  LAPTOP_GAMING: { bg: "bg-[#4B2138]/50", text: "text-[#FADCD5]", border: "border-[#6D3C52]/40" },
  PERIPHERAL: { bg: "bg-[#2D222F]", text: "text-[#A88D99]", border: "border-[#4B2138]" },
  OTHER: { bg: "bg-[#2D222F]", text: "text-[#A88D99]", border: "border-[#4B2138]" },
};
