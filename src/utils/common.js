/**
 * Format a number as currency (with comma separators)
 * @param {number} amount - The amount to format
 * @returns {string} - The formatted string
 */
export function formatCurrency(amount) {
  if (amount === undefined || amount === null) {
    return "0";
  }
  return amount.toLocaleString();
}

/**
 * Prevent non-number input in text fields
 * Allows: numbers, decimal point, and navigation keys
 * @param {Event} event - The keyboard event
 */
export function preventNonNumberInput(event) {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (
    [
      "Backspace",
      "Delete",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Enter",
      "Home",
      "End",
    ].includes(event.key)
  ) {
    return;
  }
  if (!/^[\d.]$/.test(event.key)) {
    event.preventDefault();
  }
}

/**
 * Auto-scroll to focused input/textarea inside a modal
 * @param {Event} event - The focusin event
 */
export function handleFocusIn(event) {
  const target = event.target;
  if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
    setTimeout(() => {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 250);
  }
}

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} - Today's date string
 */
export function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

/**
 * Force light mode by removing dark class from html
 * Useful for shared views that should always be light
 */
export function forceLightMode() {
  document.documentElement.classList.remove("dark");
}

/**
 * Restore theme based on localStorage
 */
export function restoreTheme() {
  if (localStorage.getItem("theme") === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

/**
 * Clean PromptPay ID by removing non-digit characters
 * @param {string} id - The PromptPay ID input
 * @returns {string} - Cleaned ID
 */
export function cleanPromptpayID(id) {
  return String(id || "").replace(/\D/g, "");
}

/**
 * Validate PromptPay ID format (Mobile: 10 digits starting with 0, Citizen ID: 13 digits, e-Wallet: 15 digits)
 * @param {string} id - The PromptPay ID input
 * @returns {boolean} - True if valid
 */
export function validatePromptpayID(id) {
  const cleaned = cleanPromptpayID(id);
  return /^(0\d{9}|\d{13}|\d{15})$/.test(cleaned);
}

// Round amount based on mode
export function applyRounding(amount, mode) {
  const num = Number(amount) || 0;
  if (mode === "round" || mode === "ceil") {
    return Math.ceil(num);
  }
  return Number(num.toFixed(2));
}
