/**
 * Utilitários para compartilhamento de assinaturas
 * @version 3.1.1
 */

import { supabase } from '@/integrations/supabase/client';
import { SubscriptionData } from '@/types/subscriptionTypes';

const TELEGRAM_BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHANNEL_ID = import.meta.env.VITE_TELEGRAM_CHANNEL_ID;
const SITE_URL = import.meta.env.VITE_SITE_URL;

export const APP_VERSION = '3.1.1';

/**
 * Converte valor para booleano de forma segura
 */
export function toBooleanSafe(value: any): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  if (typeof value === 'number') {
    return value === 1;
  }
  return false;
}

/**
 * Atualiza o status de postagem automática no Telegram
 */
export async function updateAutoPostingStatus(enabled: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('site_configurations')
      .upsert({
        key: 'auto_post_to_telegram',
        value: enabled.toString(),
        description: 'Enable/disable automatic posting to Telegram'
      });
    
    if (error) {
      console.error('Erro ao atualizar configuração de autopost:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar configuração de autopost:', error);
    return false;
  }
}

/**
 * Gera link para compartilhamento via WhatsApp
 */
export function getWhatsAppShareLink(subscription: SubscriptionData): string {
  const title = subscription.customTitle || subscription.title;
  const price = subscription.price;
  const paymentMethod = subscription.paymentMethod;
  const subscriptionLink = `${SITE_URL}/assinatura/${subscription.code}`;
  
  let message = `🎬 *${title}*\n💰 Preço: ${price}\n💳 Pagamento: ${paymentMethod}\n\n`;
  
  if (subscription.whatsappNumber) {
    message += `📞 WhatsApp: ${subscription.whatsappNumber}\n`;
  }
  if (subscription.telegramUsername) {
    message += `✉️ Telegram: ${subscription.telegramUsername}\n`;
  }
  
  message += `🔗 Link: ${subscriptionLink}`;
  
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/**
 * Gera link para compartilhamento via Telegram
 */
export function getTelegramShareLink(subscription: SubscriptionData): string {
  const title = subscription.customTitle || subscription.title;
  const price = subscription.price;
  const paymentMethod = subscription.paymentMethod;
  const subscriptionLink = `${SITE_URL}/assinatura/${subscription.code}`;
  
  let message = `🎬 *${title}*\n💰 Preço: ${price}\n💳 Pagamento: ${paymentMethod}\n\n`;
  
  if (subscription.whatsappNumber) {
    message += `📞 WhatsApp: ${subscription.whatsappNumber}\n`;
  }
  if (subscription.telegramUsername) {
    message += `✉️ Telegram: ${subscription.telegramUsername}\n`;
  }
  
  message += `🔗 Link: ${subscriptionLink}`;
  
  return `https://t.me/share/url?url=${encodeURIComponent(subscriptionLink)}&text=${encodeURIComponent(message)}`;
}

async function getTelegramMessageId(subscriptionId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('telegram_messages')
      .select('message_id')
      .eq('subscription_id', subscriptionId)
      .single();
    
    if (error) {
      console.error('Erro ao buscar message_id:', error);
      return null;
    }
    
    return data?.message_id || null;
  } catch (error) {
    console.error('Erro ao buscar message_id:', error);
    return null;
  }
}

async function saveTelegramMessageId(subscriptionId: string, messageId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('telegram_messages')
      .insert([{ subscription_id: subscriptionId, message_id: messageId }]);
    
    if (error) {
      console.error('Erro ao salvar message_id:', error);
    }
  } catch (error) {
    console.error('Erro ao salvar message_id:', error);
  }
}

export async function sendToTelegramGroup(subscriptionId: string): Promise<any> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL_ID) {
    console.warn('Telegram bot token ou channel ID não configurados.');
    return { success: false, message: 'Telegram não configurado.' };
  }

  try {
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single();

    if (subscriptionError) {
      console.error('Erro ao buscar detalhes da assinatura:', subscriptionError);
      return { success: false, message: 'Erro ao buscar assinatura.' };
    }

    if (!subscription) {
      console.warn('Assinatura não encontrada:', subscriptionId);
      return { success: false, message: 'Assinatura não encontrada.' };
    }

    const title = subscription.custom_title || subscription.title;
    const price = subscription.price;
    const paymentMethod = subscription.payment_method;
    const whatsappNumber = subscription.whatsapp_number;
    const telegramUsername = subscription.telegram_username;
    const subscriptionLink = `${SITE_URL}/assinatura/${subscription.code}`;

    let message = `📣 Nova assinatura!\n\n${title}\n💰 Preço: ${price}\n💳 Pagamento: ${paymentMethod}\n\n`;
    
    if (whatsappNumber) {
      message += `📞 WhatsApp: ${whatsappNumber}\n`;
    }
    if (telegramUsername) {
      message += `✉️ Telegram: ${telegramUsername}\n`;
    }
    
    message += `🔗 Link: ${subscriptionLink}`;

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const payload = {
      chat_id: TELEGRAM_CHANNEL_ID,
      text: message,
      parse_mode: 'Markdown'
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.ok) {
      console.log('Mensagem enviada para o Telegram:', data.result.message_id);
      await saveTelegramMessageId(subscriptionId, data.result.message_id.toString());
      return { success: true, message: 'Mensagem enviada para o Telegram!' };
    } else {
      console.error('Erro ao enviar mensagem para o Telegram:', data);
      return { success: false, message: 'Erro ao enviar mensagem para o Telegram.' };
    }
  } catch (error: any) {
    console.error('Erro ao enviar para o Telegram:', error);
    return { success: false, message: 'Erro ao enviar para o Telegram.' };
  }
}

export async function deleteFromTelegramGroup(subscriptionId: string): Promise<any> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL_ID) {
    console.warn('Telegram bot token ou channel ID não configurados.');
    return { success: false, message: 'Telegram não configurado.' };
  }

  try {
    const messageId = await getTelegramMessageId(subscriptionId);
    
    if (!messageId) {
      console.warn('Message ID não encontrado para a assinatura:', subscriptionId);
      return { success: false, message: 'Message ID não encontrado.' };
    }

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteMessage`;
    const payload = {
      chat_id: TELEGRAM_CHANNEL_ID,
      message_id: messageId
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.ok) {
      console.log('Mensagem excluída do Telegram:', messageId);

      // Remover o message_id do banco de dados
      const { error } = await supabase
        .from('telegram_messages')
        .delete()
        .eq('subscription_id', subscriptionId);

      if (error) {
        console.error('Erro ao remover message_id do banco de dados:', error);
      }

      return { success: true, message: 'Mensagem excluída do Telegram!' };
    } else {
      console.error('Erro ao excluir mensagem do Telegram:', data);
      return { success: false, message: 'Erro ao excluir mensagem do Telegram.' };
    }
  } catch (error: any) {
    console.error('Erro ao excluir do Telegram:', error);
    return { success: false, message: 'Erro ao excluir do Telegram.' };
  }
}

export async function isAutoPostingEnabled(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('site_configurations')
      .select('value')
      .eq('key', 'auto_post_to_telegram')
      .single();
    
    if (error) {
      console.error('Erro ao verificar configuração de autopost:', error);
      return false;
    }
    
    return data?.value === 'true';
  } catch (error) {
    console.error('Erro ao verificar configuração de autopost:', error);
    return false;
  }
}
