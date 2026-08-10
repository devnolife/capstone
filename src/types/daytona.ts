export interface DayCodeToken {
  /** text content of the token (may include leading/trailing spaces) */
  t: string;
  /** exact color from the source site; omitted = inherit default code color */
  color?: string;
}

export type DayCodeLine = DayCodeToken[];

export interface DayHeroLanguage {
  id: string;
  label: string;
  installCommand: string;
  code: DayCodeLine[];
}

export interface DayApiTab {
  id: string;
  icon: string;
  title: string;
  description: string;
  code: DayCodeLine[];
}

export interface DayLogoCell {
  name: string;
  image: string;
  width: number;
  height: number;
  badge?: "Case Study" | "Quote";
  href?: string;
}

export interface DayAiFirstCard {
  title: string;
  description: string;
  image: string;
}

export interface DayOsCard {
  icon: string;
  title: string;
  description: string;
  href: string;
}

export interface DayPriceRow {
  label: string;
  perHour: string;
  perSecond: string;
}

export interface DayPriceGroup {
  icon?: string;
  title: string;
  rows: DayPriceRow[];
  footnotePerHour?: string;
  footnotePerSecond?: string;
}

export interface DayTestimonial {
  quote: string;
  name: string;
  role: string;
  avatar: string;
}

export interface DayDockerCard {
  title: string;
  description: string;
  image: string;
  large?: boolean;
}

export interface DayFaqItem {
  question: string;
  answer: string;
}

export interface DayFooterColumn {
  title: string;
  links: { label: string; href: string }[];
}
