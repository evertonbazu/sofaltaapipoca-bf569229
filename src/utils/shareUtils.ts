
import { SubscriptionData } from '@/types/subscriptionTypes';
import { supabase } from '@/integrations/supabase/client';

/**
 * Formats subscription data for sharing on messaging platforms
 */
export const formatSubscriptionForSharing = (subscription: SubscriptionData): string => {
  // Format the subscription data according to the specified template
  let content = '';
  
  // Title with icon
  content += `${subscription.icon || '🖥'} ${subscription.title}\n`;
  
  // Price
  content += `🏦 ${subscription.price}\n`;
  
  // Payment method (added)
  if (subscription.paymentMethod) {
    content += `🤝🏼 ${subscription.paymentMethod}\n`;
  }
  
  // Status
  content += `📌 ${subscription.status}\n`;
  
  // Access method
  content += `🔐 ${subscription.access}\n`;
  
  // Contact methods
  if (subscription.telegramUsername) {
    content += `📩 ${subscription.telegramUsername}\n`;
  }
  
  if (subscription.whatsappNumber) {
    content += `📱 https://wa.me/${subscription.whatsappNumber}\n`;
  }
  
  // Date added
  if (subscription.addedDate) {
    content += `\n📅 Adicionado em: ${subscription.addedDate}`;
  }
  
  return content;
};

/**
 * Creates a WhatsApp share link with formatted subscription data
 */
export const getWhatsAppShareLink = (subscription: SubscriptionData): string => {
  const formattedText = encodeURIComponent(formatSubscriptionForSharing(subscription));
  return `https://wa.me/?text=${formattedText}`;
};

/**
 * Creates a Telegram share link with formatted subscription data
 */
export const getTelegramShareLink = (subscription: SubscriptionData): string => {
  const formattedText = encodeURIComponent(formatSubscriptionForSharing(subscription));
  return `https://t.me/share/url?url=&text=${formattedText}`;
};

/**
 * Sends a subscription to the Telegram group configured in settings
 */
export const sendToTelegramGroup = async (subscriptionId: string): Promise<{success: boolean, error?: string}> => {
  try {
    const { data, error } = await supabase.functions.invoke('telegram-integration', {
      body: {
        action: 'send-subscription',
        subscriptionId
      }
    });
    
    if (error) {
      console.error('Erro na função edge do Telegram:', error);
      throw new Error(error.message || 'Falha ao enviar para o grupo do Telegram');
    }
    
    if (!data?.success) {
      console.error('Erro no envio para o Telegram:', data?.error);
      throw new Error(data?.error || 'Falha ao enviar para o grupo do Telegram');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Erro enviando para o Telegram:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido ao enviar para o Telegram'
    };
  }
};

/**
 * Verifica se a postagem automática no Telegram está ativada
 */
export const isAutoPostingEnabled = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('site_configurations')
      .select('value')
      .eq('key', 'auto_post_to_telegram')
      .single();
    
    if (error) {
      console.error('Erro ao verificar configuração de postagem automática:', error);
      return false;
    }
    
    return data?.value === 'true';
  } catch (error) {
    console.error('Erro ao verificar configuração de postagem automática:', error);
    return false;
  }
};
