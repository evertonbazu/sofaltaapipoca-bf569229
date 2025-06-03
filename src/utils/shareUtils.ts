
import { supabase } from "@/integrations/supabase/client";

// Function to safely convert a value to a boolean
export const toBooleanSafe = (value: any): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase();
    return lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes';
  }
  if (typeof value === 'number') {
    return value === 1;
  }
  return !!value; // Default to false for null, undefined, 0, etc.
};

// Function to update auto_post_to_telegram setting
export const updateAutoPostingStatus = async (enabled: boolean): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('site_configurations')
      .upsert([
        { key: 'auto_post_to_telegram', value: enabled.toString(), description: 'Enable/disable automatic posting to Telegram' }
      ], { onConflict: 'key' });

    if (error) {
      console.error('Erro ao atualizar auto_post_to_telegram:', error);
      return false;
    }

    console.log('auto_post_to_telegram atualizado com sucesso:', enabled);
    return true;
  } catch (error) {
    console.error('Erro ao atualizar auto_post_to_telegram:', error);
    return false;
  }
};

// Function to check if auto posting to Telegram is enabled
export const isAutoPostingEnabled = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('site_configurations')
      .select('value')
      .eq('key', 'auto_post_to_telegram')
      .single();

    if (error) {
      console.error('Erro ao verificar auto_post_to_telegram:', error);
      return false;
    }

    return toBooleanSafe(data?.value);
  } catch (error) {
    console.error('Erro ao verificar auto_post_to_telegram:', error);
    return false;
  }
};

// Function to send subscription to Telegram group
export const sendToTelegramGroup = async (subscriptionId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Enviando assinatura para o Telegram:', subscriptionId);
    
    const { data, error } = await supabase.functions.invoke('telegram-integration', {
      body: {
        action: 'send_subscription',
        subscription_id: subscriptionId
      }
    });

    if (error) {
      console.error('Erro ao enviar para o Telegram:', error);
      return { success: false, error: error.message };
    }

    console.log('Resposta do Telegram:', data);
    return { success: true };
  } catch (error) {
    console.error('Erro ao enviar para o Telegram:', error);
    return { success: false, error: (error as Error).message };
  }
};

// Function to delete subscription from Telegram group
export const deleteFromTelegramGroup = async (subscriptionId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Excluindo assinatura do Telegram:', subscriptionId);
    
    const { data, error } = await supabase.functions.invoke('telegram-integration', {
      body: {
        action: 'delete_subscription',
        subscription_id: subscriptionId
      }
    });

    if (error) {
      console.error('Erro ao excluir do Telegram:', error);
      return { success: false, error: error.message };
    }

    console.log('Resposta da exclusão do Telegram:', data);
    return { success: true };
  } catch (error) {
    console.error('Erro ao excluir do Telegram:', error);
    return { success: false, error: (error as Error).message };
  }
};

// Function to generate WhatsApp share link
export const getWhatsAppShareLink = (subscription: any): string => {
  const message = `🖥 *${subscription.title}*\n\n` +
    `💰 *Valor:* ${subscription.price}\n` +
    `💳 *Pagamento:* ${subscription.paymentMethod}\n` +
    `📌 *Status:* ${subscription.status}\n` +
    `🔐 *Envio:* ${subscription.access}\n\n` +
    `📞 *WhatsApp:* ${subscription.whatsappNumber}\n` +
    `📩 *Telegram:* ${subscription.telegramUsername}`;
  
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
};

// Function to generate Telegram share link
export const getTelegramShareLink = (subscription: any): string => {
  const message = `🖥 *${subscription.title}*\n\n` +
    `💰 *Valor:* ${subscription.price}\n` +
    `💳 *Pagamento:* ${subscription.paymentMethod}\n` +
    `📌 *Status:* ${subscription.status}\n` +
    `🔐 *Envio:* ${subscription.access}\n\n` +
    `📞 *WhatsApp:* ${subscription.whatsappNumber}\n` +
    `📩 *Telegram:* ${subscription.telegramUsername}`;
  
  return `https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(message)}`;
};

// Application version - updated to reflect new features
export const APP_VERSION = '2.2.0';
