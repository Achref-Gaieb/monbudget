/**
 * Semantic colour tokens for JavaScript consumers (inline styles, Recharts,
 * inline SVG). Values resolve through CSS variables declared in globals.css,
 * so they follow the active theme automatically.
 *
 * Never hardcode a hex for UI meaning — add a token here instead. Raw hex
 * values remain legitimate only for user data (a category's chosen colour).
 */
export const COLOR = {
  positive: "var(--positive)",
  negative: "var(--negative)",
  warning: "var(--warning)",
  caution: "var(--caution)",
  info: "var(--info)",
  expense: "var(--expense)",
  needs: "var(--envelope-needs)",
  wants: "var(--envelope-wants)",
  savings: "var(--envelope-savings)",
  primary: "var(--primary)",
  muted: "var(--muted-foreground)",
} as const;

/** The three budget envelopes, in display order. */
export const ENVELOPE_TOKENS = [COLOR.needs, COLOR.wants, COLOR.savings] as const;

/**
 * Translucent surface derived from any colour — a CSS variable *or* a raw hex
 * from user data. Replaces the `${hex}1a` suffix trick, which silently breaks
 * as soon as the colour is a variable.
 */
export function softBg(color: string, percent = 10): string {
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}
