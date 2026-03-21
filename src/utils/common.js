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
