/**
 * Extracts and formats WhatsApp number from URL or text
 * @param input WhatsApp URL or number string
 * @returns Formatted WhatsApp number
 */
export const formatWhatsAppNumber = (input: string): string => {
  // If it's a WhatsApp URL, extract the number
  if (input.includes('wa.me/') || input.includes('whatsapp.com/')) {
    const numberMatch = input.match(/wa\.me\/(\d+)|whatsapp\.com\/send\?phone=(\d+)/);
    if (numberMatch) {
      const number = numberMatch[1] || numberMatch[2];
      return number;
    }
  }
  
  // If it's already a number, just return it after cleaning
  const cleaned = input.replace(/\D/g, '');
  if (cleaned.length >= 11) { // At least country code + area code + number
    return cleaned;
  }
  
  // Default fallback
  return input;
};

/**
 * Formats a price string to ensure correct formatting (e.g. "R$ 10,00")
 * @param price The price string to format
 * @returns Formatted price string
 */
export const formatPrice = (price: string): string => {
  if (!price) return 'R$ 0,00';
  
  // If it already has R$, just return it
  if (price.includes('R$')) return price;
  
  // Check if it's just a number
  const numericPrice = parseFloat(price.replace(',', '.'));
  if (!isNaN(numericPrice)) {
    return `R$ ${numericPrice.toFixed(2).replace('.', ',')}`;
  }
  
  // Otherwise, add R$ prefix
  return `R$ ${price}`;
};
