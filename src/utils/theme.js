import { colord, extend } from "colord";
import mixPlugin from "colord/plugins/mix";

extend([mixPlugin]);

/**
 * Converts a hex color string to its R, G, B components.
 * Supports both short (#3bf) and long (#33bbff) formats.
 * @param {string} hex - The hex color code
 * @returns {{r: number, g: number, b: number}}
 */
export function hexToRgb(hex) {
  const rgb = colord(hex || "#0066cc").toRgb();
  return { r: rgb.r, g: rgb.g, b: rgb.b };
}

/**
 * Converts RGB to HSL
 * @returns {{h: number, s: number, l: number}} h in [0,360], s/l in [0,100]
 */
export function rgbToHsl(r, g, b) {
  const hsl = colord({ r, g, b }).toHsl();
  return { h: Math.round(hsl.h), s: Math.round(hsl.s), l: Math.round(hsl.l) };
}

/**
 * Converts HSL to RGB
 */
export function hslToRgb(h, s, l) {
  const rgb = colord({ h, s, l }).toRgb();
  return { r: rgb.r, g: rgb.g, b: rgb.b };
}

/**
 * Convert RGB to hex string
 */
export function rgbToHex(r, g, b) {
  return colord({ r, g, b }).toHexString();
}

/**
 * Get a complete theme set derived from a primary color.
 * Secondary = hue shifted +60°, slightly desaturated, slightly lighter
 * This creates a harmonious but visually distinct pair.
 * @param {string} primaryHex
 * @returns {{ primary: string, secondary: string, primaryRgb: {r,g,b}, secondaryRgb: {r,g,b} }}
 */
export function getThemeColors(primaryHex) {
  const color = colord(primaryHex);
  const rgb = color.toRgb();
  const hsl = color.toHsl();

  // Secondary: shift hue +60°, reduce saturation by 20%, keep lightness similar
  const secondary = colord({
    h: (hsl.h + 60) % 360,
    s: Math.max(20, hsl.s - 20),
    l: Math.min(55, hsl.l + 5),
  });

  return {
    primary: primaryHex,
    secondary: secondary.toHexString(),
    primaryRgb: rgb,
    secondaryRgb: secondary.toRgb(),
  };
}

/**
 * Calculates harmonized primary, light (hover), and dark (active/focus) variants,
 * then updates the document root with space-separated RGB values for Tailwind compatibility.
 * @param {string} hexColor - The main accent color chosen for the group.
 */
export function applyGroupTheme(hexColor) {
  if (typeof window === "undefined" || !document || !document.documentElement)
    return;

  const color = colord(hexColor || "#0066cc");
  const { r, g, b } = color.toRgb();

  // Calculate Primary Light: blend base with 20% white tint (mix with white at 20%)
  const light = color.mix("#ffffff", 0.2).toRgb();

  // Calculate Primary Dark: shade base by 20% darker
  const dark = color.darken(0.2).toRgb();

  // Inject into root using Tailwind-friendly space-separated RGB channel format
  document.documentElement.style.setProperty(
    "--color-primary-rgb",
    `${r} ${g} ${b}`,
  );
  document.documentElement.style.setProperty(
    "--color-primary-light-rgb",
    `${light.r} ${light.g} ${light.b}`,
  );
  document.documentElement.style.setProperty(
    "--color-primary-dark-rgb",
    `${dark.r} ${dark.g} ${dark.b}`,
  );

  // Calculate Secondary color for unpaid/pending states (shift hue +60°, reduce sat, increase light)
  const hsl = color.toHsl();
  const secondary = colord({
    h: (hsl.h + 60) % 360,
    s: Math.max(20, hsl.s - 20),
    l: Math.min(55, hsl.l + 5),
  });
  const sec = secondary.toRgb();

  document.documentElement.style.setProperty(
    "--color-secondary-rgb",
    `${sec.r} ${sec.g} ${sec.b}`,
  );

  // Calculate Primary Container: blend base with 88% white tint
  const container = color.mix("#ffffff", 0.88).toRgb();

  const isDark =
    document.documentElement.classList.contains("dark") ||
    (typeof localStorage !== "undefined" &&
      localStorage.getItem("theme") === "dark");

  // Material Design 3 dynamic color tokens
  document.documentElement.style.setProperty(
    "--md-sys-color-primary",
    `rgb(${r}, ${g}, ${b})`,
  );

  if (isDark) {
    const darkContainer = color.darken(0.85).toRgb();
    document.documentElement.style.setProperty(
      "--md-sys-color-primary-container",
      `rgb(${darkContainer.r}, ${darkContainer.g}, ${darkContainer.b})`,
    );
    document.documentElement.style.setProperty(
      "--md-sys-color-surface",
      "#0c0c0e",
    );
    document.documentElement.style.setProperty(
      "--md-sys-color-surface-container",
      "#17171c",
    );
    document.documentElement.style.setProperty(
      "--md-sys-color-on-surface",
      "#f3f4f6",
    );
    document.documentElement.style.setProperty(
      "--md-sys-color-outline",
      "#25252c",
    );
  } else {
    document.documentElement.style.setProperty(
      "--md-sys-color-primary-container",
      `rgb(${container.r}, ${container.g}, ${container.b})`,
    );
    document.documentElement.style.setProperty(
      "--md-sys-color-surface",
      "#f8f9fb",
    );
    document.documentElement.style.setProperty(
      "--md-sys-color-surface-container",
      "#ffffff",
    );
    document.documentElement.style.setProperty(
      "--md-sys-color-on-surface",
      "#1d1d1f",
    );
    document.documentElement.style.setProperty(
      "--md-sys-color-outline",
      "#f1f1f4",
    );
  }
}
