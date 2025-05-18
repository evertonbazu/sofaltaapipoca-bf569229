
import { SubscriptionData } from '@/types/subscriptionTypes';

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
  
  // Status
  content += `📌${subscription.status}\n`;
  
  // Access method
  content += `🔐 ${subscription.access}\n`;
  
  // Contact methods
  if (subscription.telegramUsername) {
    content += `📩${subscription.telegramUsername}\n`;
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
    const response = await fetch('/api/telegram-integration/send-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscriptionId }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to send to Telegram group');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error sending to Telegram:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error sending to Telegram'
    };
  }
};
