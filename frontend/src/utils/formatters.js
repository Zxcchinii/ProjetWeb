/**
 * Format a number as currency (EUR)
 * @param {number|string} value - Amount to format
 * @returns {string} - Formatted currency string
 */
export function formatCurrency(value) {
  const amount = parseFloat(value);
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(amount);
}