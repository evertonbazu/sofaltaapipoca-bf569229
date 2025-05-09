
import { supabase } from '@/integrations/supabase/client';
import { prepareSubscriptionForDB, Subscription } from '@/types/subscriptionTypes';

// Function to generate a subscription code
export const generateCode = () => `SF${Math.floor(1000 + Math.random() * 9000)}`;

// Function to parse subscription data from text format
export const parseSubscription = (text: string): Partial<Subscription> => {
  // Extract title (after the 🖥 emoji)
  const titleMatch = text.match(/🖥\s+(.+?)(?=\n|$)/);
  const title = titleMatch ? titleMatch[1].trim() : '';

  // Extract price (after the 🏦 emoji)
  const priceMatch = text.match(/🏦\s+(.+?)(?=\n|$)/);
  const price = priceMatch ? priceMatch[1].trim() : '';

  // Extract status (after the 📌 emoji)
  const statusMatch = text.match(/📌\s+(.+?)(?=\n|$)/);
  const status = statusMatch ? statusMatch[1].includes('disponível') ? 'disponível' : 'indisponível' : '';

  // Extract access method (after the 🔐 emoji)
  const accessMatch = text.match(/🔐\s+(.+?)(?=\n|$)/);
  const access = accessMatch ? accessMatch[1].trim() : '';

  // Extract telegram username (after the 📩 emoji)
  const telegramMatch = text.match(/📩\s+(.+?)(?=\n|$)/);
  const telegram_username = telegramMatch ? telegramMatch[1].trim() : '';

  // Extract WhatsApp number (after the 📱 emoji or URL)
  const whatsappMatch = text.match(/📱\s+(?:https:\/\/wa\.me\/)?(\d+)/);
  const whatsapp_number = whatsappMatch ? whatsappMatch[1].trim() : '';

  // Extract added date if available
  const dateMatch = text.match(/📅\s+Adicionado\s+em:\s+(\d{2}\/\d{2}\/\d{4})/);
  const added_date = dateMatch ? dateMatch[1] : new Date().toLocaleDateString('pt-BR');

  // Extract payment method from price
  const paymentMethodMatch = price.match(/-\s*([^(]+)(?:\s*\([^)]+\))?/);
  const payment_method = paymentMethodMatch ? paymentMethodMatch[1].trim() : 'PIX';

  return {
    title,
    price,
    status: status || 'disponível',
    access,
    telegram_username,
    whatsapp_number,
    added_date,
    payment_method,
    header_color: 'bg-blue-600', // Default blue
    price_color: 'text-green-600', // Default green
    code: generateCode(),
  };
};

// Parse a subscription from a Telegram text block
export const parseSubscriptionText = (text: string): Partial<Subscription> | null => {
  try {
    return parseSubscription(text);
  } catch (error) {
    console.error('Error parsing subscription text:', error);
    return null;
  }
};

// Function to add a single subscription
export const addSubscription = async (subscription: Partial<Subscription>): Promise<{ success: boolean, error?: any }> => {
  try {
    // Make sure all required fields are present
    const requiredFields = ['title', 'price', 'status', 'access', 'header_color', 'price_color', 'whatsapp_number', 'telegram_username', 'code'];
    const missingFields = requiredFields.filter(field => !subscription[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    const { error } = await supabase
      .from('subscriptions')
      .insert({
        title: subscription.title,
        price: subscription.price,
        status: subscription.status,
        access: subscription.access,
        header_color: subscription.header_color || 'bg-blue-600',
        price_color: subscription.price_color || 'text-green-600',
        whatsapp_number: subscription.whatsapp_number,
        telegram_username: subscription.telegram_username,
        code: subscription.code || generateCode(),
        payment_method: subscription.payment_method || 'PIX',
        added_date: subscription.added_date || new Date().toLocaleDateString('pt-BR')
      });
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error adding subscription:', error);
    return { success: false, error };
  }
};

// Function to bulk import subscriptions from text
export const bulkImportSubscriptions = async (text: string): Promise<{ success: boolean, added: number, errors: number }> => {
  // Split the text into individual subscription blocks
  const subscriptionBlocks = text.split(/ANÚNCIOS SÓ FALTA A PIPOCA 🍿,/).filter(block => block.trim().length > 0);
  
  let added = 0;
  let errors = 0;
  
  for (const block of subscriptionBlocks) {
    try {
      const subscription = parseSubscription(block);
      const result = await addSubscription(subscription);
      
      if (result.success) {
        added++;
      } else {
        errors++;
      }
    } catch (error) {
      console.error('Error parsing subscription:', block, error);
      errors++;
    }
  }
  
  return { success: added > 0, added, errors };
};

// Function that is imported by ImportBulkSubscriptions.tsx
export const importSubscriptionsFromText = async (text: string): Promise<{ success: number; errors: number }> => {
  const result = await bulkImportSubscriptions(text);
  return { success: result.added, errors: result.errors };
};
