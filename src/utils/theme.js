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
    // Default fallback to brand blue (0 102 204 / #0066cc)
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

