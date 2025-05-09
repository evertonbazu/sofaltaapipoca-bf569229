
import { Subscription } from "@/types/subscriptionTypes";

export interface ParsedSubscription {
  title: string;
  price: string;
  status: string;
  access: string;
  telegram_username: string;
  whatsapp_number: string;
  added_date?: string;
  icon?: string;
}

/**
 * Parse subscription information from the Telegram message format
 * 
 * Example format:
 * ANÚNCIOS SÓ FALTA A PIPOCA 🍿, [09/04/2025 09:21]
 * 🖥 PARAMOUNT PADRÃO (MELI+)
 * 🏦 R$ 6,00 - PIX (Mensal)
 * 📌Assinado (2 vagas)
 * 🔐 LOGIN E SENHA
 * 📩@Eduardok10cds
 * 📱 https://wa.me/5575999997951
 */
export function parseSubscriptionText(text: string): ParsedSubscription | null {
  try {
    // Split the text into lines
    const lines = text.trim().split('\n');
    
    // Extract date from the first line
    const dateMatch = lines[0].match(/\[(\d{2}\/\d{2}\/\d{4})/);
    const added_date = dateMatch ? dateMatch[1] : undefined;
    
    // Extract title, usually in the second line
    const titleLine = lines.find(line => line.includes('🖥')) || '';
    const title = titleLine.replace('🖥', '').trim();
    
    // Extract price
    const priceLine = lines.find(line => line.includes('🏦')) || '';
    const price = priceLine.replace('🏦', '').trim();
    
    // Extract payment method from price line (already included in price)
    const payment_method = price.includes('-') ? price.split('-')[1].trim() : 'PIX (Mensal)';
    
    // Extract status
    const statusLine = lines.find(line => line.includes('📌')) || '';
    const status = statusLine.replace('📌', '').trim();
    
    // Extract access type
    const accessLine = lines.find(line => line.includes('🔐')) || '';
    const access = accessLine.replace('🔐', '').trim();
    
    // Extract telegram
    const telegramLine = lines.find(line => line.includes('📩')) || '';
    const telegram_username = telegramLine.replace('📩', '').trim();
    
    // Extract WhatsApp
    const whatsappLine = lines.find(line => line.includes('📱')) || '';
    let whatsapp_number = '';
    
    if (whatsappLine) {
      // Extract number from WhatsApp URL
      const whatsappMatch = whatsappLine.match(/(\d+)/);
      whatsapp_number = whatsappMatch ? whatsappMatch[0] : '';
    }
    
    // Determine icon based on title
    let icon = 'tv'; // Default icon
    
    if (title.includes('NETFLIX')) icon = 'video';
    else if (title.includes('YOUTUBE')) icon = 'youtube';
    else if (title.includes('SPOTIFY')) icon = 'music';
    else if (title.includes('PARAMOUNT')) icon = 'monitor';
    else if (title.includes('DISNEY')) icon = 'monitor';
    else if (title.includes('PRIME')) icon = 'monitor';
    else if (title.includes('MAX')) icon = 'monitor';
    else if (title.includes('GLOBO')) icon = 'monitor';
    else if (title.includes('CURSOS') || title.includes('ALURA')) icon = 'book';
    else if (title.includes('MICROSOFT')) icon = 'monitor';
    else if (title.includes('GOOGLE')) icon = 'monitor';
    else if (title.includes('APPLE')) icon = 'apple';

    return {
      title,
      price,
      payment_method,
      status,
      access,
      telegram_username,
      whatsapp_number,
      added_date,
      icon
    };
  } catch (error) {
    console.error('Error parsing subscription text:', error);
    return null;
  }
}

/**
 * Parse multiple subscription messages separated by blank lines
 */
export function parseMultipleSubscriptionTexts(text: string): ParsedSubscription[] {
  // Remove any extra spaces or characters that might cause issues
  const cleanedText = text.replace(/\r/g, '');
  
  // Split by the pattern that starts each entry
  const subscriptionTexts = cleanedText.split(/ANÚNCIOS SÓ FALTA A PIPOCA 🍿,/);
  
  // Filter out any empty entries and parse each subscription
  return subscriptionTexts
    .filter(text => text.trim().length > 0)
    .map(text => parseSubscriptionText('ANÚNCIOS SÓ FALTA A PIPOCA 🍿,' + text))
    .filter((sub): sub is ParsedSubscription => sub !== null);
}

/**
 * Convert parsed subscriptions to the database format
 */
export function convertToSubscriptionFormat(parsed: ParsedSubscription): Partial<Subscription> {
  return {
    title: parsed.title,
    price: parsed.price,
    payment_method: parsed.price.includes('-') ? parsed.price.split('-')[1].trim() : 'PIX (Mensal)',
    status: parsed.status,
    access: parsed.access,
    header_color: 'bg-blue-600',  // Default colors
    price_color: 'text-blue-600', // Default colors
    whatsapp_number: parsed.whatsapp_number,
    telegram_username: parsed.telegram_username,
    icon: parsed.icon,
    added_date: parsed.added_date,
    code: `SF${Math.floor(Math.random() * 9000 + 1000)}` // Generate random code
  };
}
