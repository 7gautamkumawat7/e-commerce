/**
 * Standard utility formatters for Indian & Global E-Commerce
 */

/**
 * Formats a number or cents to Indian Rupee currency format (e.g., ₹4,999.00 or ₹4,999)
 */
export function formatINR(amount: number, showDecimals: boolean = false): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0
  }).format(amount);
}

/**
 * Converts price in cents (integer) to standard rupee string
 */
export function formatCents(cents: number): string {
  return formatINR(cents / 100);
}

/**
 * Formats a Date object or ISO string to standard customer readable format (e.g. "Oct 24, 2026")
 */
export function formatDate(date: string | Date | undefined): string {
  if (!date) return 'Recently';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'Recently';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Formats date and time for audit and tracking logs (e.g. "Oct 24, 2026, 11:30 PM")
 */
export function formatDateTime(date: string | Date | undefined): string {
  if (!date) return 'Recently';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'Recently';
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Truncates text with ellipsis if length exceeds max
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}
