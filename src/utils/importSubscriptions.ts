
import { supabase } from '@/integrations/supabase/client';
import { generateSubscriptionCode } from '@/utils/codeGenerator';
import { formatWhatsAppNumber } from '@/utils/formatters';
import { parseSubscriptionColorFromTitle } from '@/utils/colorHelpers';

interface ParsedSubscription {
  title: string;
  price: string;
  payment_method: string;
  status: string;
  access: string;
  telegram_username: string;
  whatsapp_number: string;
  added_date: string;
  header_color: string;
  price_color: string;
  code: string;
}

/**
 * Parses a formatted subscription text into structured data
 * Format example:
 * 🖥 NETFLIX (DISPOSITIVOS MÓVEIS/TV)
 * 🏦 R$ 32,00 - PIX (Mensal)
 * 📌Assinado (1 vaga)
 * 🔐 CONVITE POR E-MAIL
 * 📩@EvandersonAraujo
 * 📱 https://wa.me/5531975374153
 */
export const parseSubscriptionText = (text: string): ParsedSubscription | null => {
  try {
    // Split by new lines and filter out empty lines or headers
    const lines = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.includes('ANÚNCIOS SÓ FALTA A PIPOCA') && !line.includes('adicionado em:'));
    
    if (lines.length < 5) {
      console.error('Invalid subscription format, not enough lines');
      return null;
    }
    
    // Extract title
    const titleLine = lines.find(l => l.includes('🖥')) || '';
    const title = titleLine.replace('🖥', '').trim();
    
    // Extract price and payment method
    const priceLine = lines.find(l => l.includes('🏦')) || '';
    const priceMatch = priceLine.match(/🏦\s*(.*?)(?:\s*-\s*(.*))?$/);
    const price = priceMatch ? priceMatch[1].trim() : '';
    const paymentMethod = priceMatch && priceMatch[2] ? priceMatch[2].trim() : 'PIX (Mensal)';
    
    // Extract status
    const statusLine = lines.find(l => l.includes('📌')) || '';
    const status = statusLine.replace('📌', '').trim();
    
    // Extract access
    const accessLine = lines.find(l => l.includes('🔐')) || '';
    const access = accessLine.replace('🔐', '').trim();
    
    // Extract telegram username
    const telegramLine = lines.find(l => l.includes('📩')) || '';
    const telegramUsername = telegramLine.replace('📩', '').trim();
    
    // Extract whatsapp
    const whatsappLine = lines.find(l => l.includes('📱')) || '';
    const whatsappUrl = whatsappLine.replace('📱', '').trim();
    const whatsappNumber = formatWhatsAppNumber(whatsappUrl);
    
    // Extract added date
    const dateLine = lines.find(l => l.includes('📅')) || '';
    const dateMatch = dateLine.match(/📅\s*Adicionado em:\s*(.*)$/);
    const addedDate = dateMatch ? dateMatch[1].trim() : new Date().toLocaleDateString('pt-BR');
    
    // Generate colors based on title
    const { headerColor, priceColor } = parseSubscriptionColorFromTitle(title);
    
    // Generate subscription code
    const code = generateSubscriptionCode('SF', 9, Math.floor(Math.random() * 999) + 1);
    
    return {
      title,
      price,
      payment_method: paymentMethod,
      status,
      access,
      telegram_username: telegramUsername,
      whatsapp_number: whatsappNumber,
      added_date: addedDate,
      header_color: headerColor,
      price_color: priceColor,
      code
    };
  } catch (error) {
    console.error('Error parsing subscription text:', error);
    return null;
  }
};

/**
 * Imports multiple subscriptions from formatted text
 * @param text The formatted text containing multiple subscription listings
 * @returns A result object with success count and errors
 */
export const importSubscriptionsFromText = async (text: string): Promise<{ success: number; errors: number }> => {
  // Split by telegram group message pattern
  const subscriptionTexts = text.split(/ANÚNCIOS SÓ FALTA A PIPOCA 🍿, \[\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}\]/g)
    .filter(text => text.trim().length > 0);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const subText of subscriptionTexts) {
    const parsed = parseSubscriptionText(subText);
    
    if (parsed) {
      try {
        const { error } = await supabase
          .from('subscriptions')
          .insert({
            ...parsed,
            featured: Math.random() > 0.8 // Randomly feature some subscriptions (20% chance)
          });
          
        if (error) {
          console.error('Error inserting subscription:', error);
          errorCount++;
        } else {
          successCount++;
        }
      } catch (err) {
        console.error('Error in Supabase insert:', err);
        errorCount++;
      }
    } else {
      errorCount++;
    }
  }
  
  return { success: successCount, errors: errorCount };
};
