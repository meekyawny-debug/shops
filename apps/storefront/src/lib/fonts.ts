import {
  Inter,
  Playfair_Display,
  Cormorant_Garamond,
  DM_Serif_Display,
} from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
});

export const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
});

export const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400"],
});

export const headingFonts: Record<string, typeof playfairDisplay> = {
  "Playfair Display": playfairDisplay,
  "Cormorant Garamond": cormorantGaramond,
  "DM Serif Display": dmSerifDisplay,
  Inter: inter,
};

export function getHeadingFont(fontName: string) {
  return headingFonts[fontName] || inter;
}
