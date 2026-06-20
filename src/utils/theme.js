/**
 * Theme and Dynamic Color Harmonization Utility
 */

/**
 * Converts a hex color string to its R, G, B components.
 * Supports both short (#3bf) and long (#33bbff) formats.
 * @param {string} hex - The hex color code
 * @returns {{r: number, g: number, b: number}}
 */
export function hexToRgb(hex) {
  const cleanHex = String(hex || "").replace(/^#/, "");
  let r, g, b;

  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  } else {
    r = 0;
    g = 102;
    b = 204;
  }

  return {
    r: isNaN(r) ? 0 : r,
    g: isNaN(g) ? 102 : g,
    b: isNaN(b) ? 204 : b,
  };
}

/**
 * Converts RGB to HSL
 * @returns {{h: number, s: number, l: number}} h in [0,360], s/l in [0,100]
 */
export function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/**
 * Converts HSL to RGB
 */
export function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

/**
 * Convert RGB to hex string
 */
export function rgbToHex(r, g, b) {
  return `#${[r, g, b].map(c => Math.max(0, Math.min(255, c)).toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Get a complete theme set derived from a primary color.
 * Secondary = hue shifted +60°, slightly desaturated, slightly lighter
 * This creates a harmonious but visually distinct pair.
 * @param {string} primaryHex
 * @returns {{ primary: string, secondary: string, primaryRgb: {r,g,b}, secondaryRgb: {r,g,b} }}
 */
export function getThemeColors(primaryHex) {
  const { r, g, b } = hexToRgb(primaryHex);
  const { h, s, l } = rgbToHsl(r, g, b);

  // Secondary: shift hue +60°, reduce saturation by 20%, keep lightness similar
  const secH = (h + 60) % 360;
  const secS = Math.max(20, s - 20);
  const secL = Math.min(55, l + 5);
  const secRgb = hslToRgb(secH, secS, secL);

  return {
    primary: primaryHex,
    secondary: rgbToHex(secRgb.r, secRgb.g, secRgb.b),
    primaryRgb: { r, g, b },
    secondaryRgb: secRgb,
  };
}

/**
 * Calculates harmonized primary, light (hover), and dark (active/focus) variants,
 * then updates the document root with space-separated RGB values for Tailwind compatibility.
 * @param {string} hexColor - The main accent color chosen for the group.
 */
export function applyGroupTheme(hexColor) {
  if (typeof window === "undefined" || !document || !document.documentElement) return;

  const { r, g, b } = hexToRgb(hexColor || "#0066cc");

  // Calculate Primary Light: blend base with 20% white tint
  const lightR = Math.round(r + (255 - r) * 0.20);
  const lightG = Math.round(g + (255 - g) * 0.20);
  const lightB = Math.round(b + (255 - b) * 0.20);

  // Calculate Primary Dark: shade base by 20% darker
  const darkR = Math.round(r * 0.80);
  const darkG = Math.round(g * 0.80);
  const darkB = Math.round(b * 0.80);

  // Inject into root using Tailwind-friendly space-separated RGB channel format
  document.documentElement.style.setProperty("--color-primary-rgb", `${r} ${g} ${b}`);
  document.documentElement.style.setProperty("--color-primary-light-rgb", `${lightR} ${lightG} ${lightB}`);
  document.documentElement.style.setProperty("--color-primary-dark-rgb", `${darkR} ${darkG} ${darkB}`);

  // Calculate Secondary color for unpaid/pending states
  const { h, s, l } = rgbToHsl(r, g, b);
  const secH = (h + 60) % 360;
  const secS = Math.max(20, s - 20);
  const secL = Math.min(55, l + 5);
  const sec = hslToRgb(secH, secS, secL);

  document.documentElement.style.setProperty("--color-secondary-rgb", `${sec.r} ${sec.g} ${sec.b}`);

  // Calculate Primary Container: blend base with 88% white tint
  const containerR = Math.round(r + (255 - r) * 0.88);
  const containerG = Math.round(g + (255 - g) * 0.88);
  const containerB = Math.round(b + (255 - b) * 0.88);

  // Material Design 3 dynamic color tokens
  document.documentElement.style.setProperty("--md-sys-color-primary", `rgb(${r}, ${g}, ${b})`);
  document.documentElement.style.setProperty("--md-sys-color-primary-container", `rgb(${containerR}, ${containerG}, ${containerB})`);
  document.documentElement.style.setProperty("--md-sys-color-surface", "#f8f9fb");
  document.documentElement.style.setProperty("--md-sys-color-surface-container", "#ffffff");
  document.documentElement.style.setProperty("--md-sys-color-on-surface", "#1d1d1f");
  document.documentElement.style.setProperty("--md-sys-color-outline", "#f1f1f4");
}

