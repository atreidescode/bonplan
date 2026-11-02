export type HardwareCategory =
  | "ALL"
  | "PC_DESKTOP"
  | "LAPTOP_GAMING"
  | "GPU"
  | "CPU"
  | "RAM"
  | "SSD"
  | "MOTHERBOARD"
  | "PSU"
  | "COOLING"
  | "CASE"
  | "MONITOR"
  | "PERIPHERAL"
  | "OTHER";

export interface CategorizationResult {
  isHardware: boolean;
  category: HardwareCategory;
  confidence: number;
}

// 1. Non-hardware exclusions
const EXCLUDE_REGEX =
  /\b(serveur\s*nas|tablette|ipad|tab\s*p\d+|smartphone|t[eé]l[eé]phone|iphone|galaxy\s*s\d+|chaise\s*bureau|fauteuil\s*gamer|table\s*basse|aspirateur|lego|jouet|trottinette|velo|machine\s*a\s*laver|v[eê]tement|chaussure|sneakers|lessive|couches|nintendo\s*switch|playstation\s*5|ps5\s*slim|xbox\s*series|station\s*d['’]alimentation|panneau\s*solaire)\b/i;

// 2. Specific item categories that must take precedence over "PC Gamer" mentions
// E.g. "Ecran PC Gamer 27 pouces", "Souris PC Gamer", "Boîtier PC Gamer"
const MONITOR_REGEX =
  /\b([eé]cran(?:\s*pc)?|moniteur|144\s*hz|165\s*hz|180\s*hz|240\s*hz|280\s*hz|300\s*hz|oled\s*\d{2}["”]|ips\s*\d{2}["”]|wqhd|qhd|1440p|4k\s*uhd)\b/i;

const CASE_REGEX =
  /\b(bo[iî]tier\s*pc|boitier\s*pc|moyen\s*tour|grand\s*tour|mini\s*tour|lian\s*li|fractal\s*design|corsair\s*\d{3,4}d|nzxt\s*h[579]|boitier\s*atx)\b/i;

const PERIPHERAL_REGEX =
  /\b(casque|headset|clavier\s*m[eé]canique|souris\s*gamer|souris\s*sans\s*fil|tapis\s*de\s*souris|casque\s*gamer|micro\s*usb|logitech\s*g\s*pro|razer|steelseries|manette|webcam|seiren)\b/i;

// 3. Pre-built computers (Desktops & Laptops)
const LAPTOP_REGEX =
  /\b(pc\s*portable(?:\s*gamer)?|laptop(?:\s*gamer)?|notebook|ultrabook|macbook|omen\s*(?:max|slim)\s*\d+|victus\s*\d+|katana\s*\d+|cyborg\s*\d+|tuf\s*(?:gaming\s*)?f\d+|venturepro)\b/i;

const PC_DESKTOP_REGEX =
  /\b(pc\s*fixe|pc\s*de\s*bureau|unit[eé]\s*centrale|mini\s*pc|tour\s*pc|ordinateur\s*de\s*bureau|ordinateur\s*fixe|pccom|cyberpower|csl\s*(?:speed|sprint)|pc\s+[a-z0-9]+\s+gaming|\bpc\s*gamer\b)\b/i;

const COOLING_REGEX =
  /\b(watercooling|aio\s*\d{3}|ventirad|refroidissement|ventilateur\s*pc|noctua|thermalright|peerless\s*assassin|nzxt\s*kraken|liquid\s*freezer)\b/i;

const PSU_REGEX =
  /\b(alimentation\s*pc|alim\s*pc|psu|80\s*plus\s*(?:bronze|gold|platinum|titanium)|(?:650|750|850|1000|1200)\s*w\s*(?:modulaire|atx)?|atx\s*3\.[01])\b/i;

const MOTHERBOARD_REGEX =
  /\b(carte\s*m[eè]re|motherboard|\b[bzx]\d{2,3}[a-z]?\s*(?:gaming|aorus|tomahawk|plus|pro|hero|strix)?\b|socket\s*(?:am4|am5|lga1700|lga1851))\b/i;

// 4. Processing & Storage components (SSD, GPU, CPU, RAM)
const SSD_REGEX =
  /\b(ssd|disque\s*ssd|nvme|m\.?2\s*pcie|samsung\s*(?:970|980|990)\s*(?:evo|pro)?|crucial\s*(?:p3|p5|p310|t500|bx\d{3}|mx\d{3})|wd\s*(?:black|blue)?\s*sn\d{3}|kc3000|lexar\s*nm\d{3}|sn770|sn850x|firecuda|t-force\s*cardea)\b/i;

const GPU_REGEX =
  /\b(carte\s*graphique|gpu\s*(?:nvidia|amd)|rtx\s*\d{4}|gtx\s*\d{4}|geforce\s*rtx|radeon\s*rx\s*\d{4}|rx\s*\d{4}\s*(?:xt|xtx|gre)?|intel\s*arc\s*(?:a\d{3}|b\d{3}))\b/i;

const CPU_REGEX =
  /\b(processeur|cpu\s*amd|cpu\s*intel|ryzen\s*[3579]\s*\d{4}(?:x|x3d|f)?|intel\s*core\s*(?:i[3579]|ultra\s*[579])\s*[- ]?\d{3,5}[a-z]*)\b/i;

const RAM_REGEX =
  /\b(barrette\s*(?:de\s*)?m[eé]moire|barrette\s*ram|kit\s*ram|m[eé]moire\s*pc\s*ram|ddr4|ddr5|corsair\s*vengeance|trident\s*z|kingston\s*fury|g\.skill|ripjaws)\b/i;

export function categorizeDeal(title: string, description: string = ""): CategorizationResult {
  const t = title.toLowerCase();

  // 1. Check exclusions (Tablets, smartphones, NAS, appliances, consoles)
  if (EXCLUDE_REGEX.test(t)) {
    return { isHardware: false, category: "OTHER", confidence: 0 };
  }

  // 2. Check Screens & Monitors FIRST so "Ecran PC Gamer" is NEVER categorized as PC_DESKTOP!
  if (MONITOR_REGEX.test(t)) {
    return { isHardware: true, category: "MONITOR", confidence: 0.95 };
  }

  // 3. Check Peripherals (Souris, Casques, Claviers) so "Souris PC Gamer" is PERIPHERAL
  if (PERIPHERAL_REGEX.test(t)) {
    return { isHardware: true, category: "PERIPHERAL", confidence: 0.95 };
  }

  // 4. Check Boîtiers (CASE) - BEFORE PC_DESKTOP/GPU
  if (CASE_REGEX.test(t)) {
    return { isHardware: true, category: "CASE", confidence: 0.95 };
  }

  // 5. Check Laptops
  if (LAPTOP_REGEX.test(t)) {
    return { isHardware: true, category: "LAPTOP_GAMING", confidence: 0.95 };
  }

  // 6. Check Cooling (Watercooling, Ventirads)
  if (COOLING_REGEX.test(t)) {
    return { isHardware: true, category: "COOLING", confidence: 0.95 };
  }

  // 7. Check Power Supplies (PSU)
  if (PSU_REGEX.test(t)) {
    return { isHardware: true, category: "PSU", confidence: 0.95 };
  }

  // 8. Check Motherboard
  if (MOTHERBOARD_REGEX.test(t)) {
    return { isHardware: true, category: "MOTHERBOARD", confidence: 0.95 };
  }

  // 9. Check Prebuilt Desktop PCs
  if (PC_DESKTOP_REGEX.test(t)) {
    return { isHardware: true, category: "PC_DESKTOP", confidence: 0.95 };
  }

  // Multi-component heuristic: title mentions 3+ distinct component types -> prebuilt PC
  let componentMentions = 0;
  if (/rtx|rx\s*\d{4}/i.test(t)) componentMentions++;
  if (/ryzen|intel|core\s*i\d/i.test(t)) componentMentions++;
  if (/\b(?:16|32|64)\s*go\b/i.test(t)) componentMentions++;
  if (/ssd|to\s*nvme/i.test(t)) componentMentions++;

  if (componentMentions >= 3) {
    return { isHardware: true, category: "PC_DESKTOP", confidence: 0.9 };
  }

  // 10. Standalone Core Components (GPU, CPU, RAM, SSD)
  if (GPU_REGEX.test(t) && !t.includes("boitier") && !t.includes("boîtier")) {
    return { isHardware: true, category: "GPU", confidence: 0.9 };
  }

  if (CPU_REGEX.test(t)) {
    return { isHardware: true, category: "CPU", confidence: 0.9 };
  }

  if (RAM_REGEX.test(t)) {
    return { isHardware: true, category: "RAM", confidence: 0.9 };
  }

  if (SSD_REGEX.test(t)) {
    return { isHardware: true, category: "SSD", confidence: 0.9 };
  }

  return { isHardware: false, category: "OTHER", confidence: 0 };
}
