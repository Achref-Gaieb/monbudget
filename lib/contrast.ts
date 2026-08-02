/**
 * WCAG contrast helpers used to keep the accent colour readable.
 *
 * The accent is user-selectable, so the text drawn on top of it cannot be a
 * fixed white — a light accent (amber, emerald) would drop to ~2:1. These
 * helpers derive a pairing that always clears AA (4.5:1).
 */

const AA_NORMAL = 4.5;
/** Ink used when a light accent needs dark text on top. */
const DARK_INK = "#0a0a0a";
const LIGHT_INK = "#ffffff";

function parseHex(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function toHex(rgb: [number, number, number]): string {
  return (
    "#" +
    rgb
      .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"))
      .join("")
  );
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex).map((v) => {
    const channel = v / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

function darken(hex: string, amount: number): string {
  const rgb = parseHex(hex).map((v) => v * (1 - amount)) as [number, number, number];
  return toHex(rgb);
}

/**
 * Pairs an accent colour with a readable ink.
 *
 * Deep accents keep white text — the surface is darkened just enough to clear
 * AA, which preserves the hue. Genuinely light accents get dark ink instead,
 * because darkening them far enough would change the colour entirely.
 */
export function accessibleAccent(hex: string): { surface: string; ink: string } {
  for (let step = 0; step <= 5; step++) {
    const surface = darken(hex, step * 0.05);
    if (contrastRatio(surface, LIGHT_INK) >= AA_NORMAL) {
      return { surface, ink: LIGHT_INK };
    }
  }
  return { surface: hex, ink: DARK_INK };
}
