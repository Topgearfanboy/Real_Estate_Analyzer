export function formatCurrency(value: string): string {
  const num = parseFloat(value.replace(/[^0-9.-]/g, ''));
  if (isNaN(num)) return '';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatCurrencyInput(value: string): string {
  // Remove non-numeric characters except decimal
  const cleaned = value.replace(/[^0-9.]/g, '');
  const num = parseFloat(cleaned);
  
  if (isNaN(num)) return '';
  
  // Format with commas, no $ sign for input
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

export function parseCurrency(value: string): string {
  // Remove $ and commas, keep only numbers and decimal
  return value.replace(/[$,]/g, '');
}
