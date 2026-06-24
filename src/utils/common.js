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
  const char = String.fromCharCode(event.keyCode || event.which);
  if (
    !/[\d.]/.test(char) &&
    ![
      "Backspace",
      "Delete",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "Enter",
    ].includes(event.key)
  ) {
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
