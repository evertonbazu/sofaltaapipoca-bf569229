
import { SubscriptionData } from '@/types/subscriptionTypes';
import { supabase } from '@/integrations/supabase/client';

/**
 * Version 2.7.0
 * - Improved Telegram integration reliability
 * - Fixed auto-posting functionality issues
 * - Added better configuration defaults
 * 
 * Version 2.6.0
 * - Added default auto-posting enabled
 * - Set default bot token and group ID
 * - Updated version display mechanism
 * 
 * Version 2.5.0
 * - Fixed additional type handling issues
 * - Improved string-to-boolean conversion logic
 * - Better handling of configuration values with strict typing
 */

// Export the current version as a constant for use throughout the app
export const APP_VERSION = "2.7.0";

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
    console.log('Sending subscription to Telegram group:', subscriptionId);
    
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
    
    console.log('Successfully sent subscription to Telegram group');
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
 * Helper function to convert any value to a proper boolean
 * This ensures consistent boolean conversion throughout the app
 */
export const toBooleanSafe = (value: any): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }
  
  if (typeof value === 'string') {
    const lowercaseValue = value.toLowerCase();
    return lowercaseValue === 'true' || lowercaseValue === '1' || lowercaseValue === 'yes';
  }
  
  if (typeof value === 'number') {
    return value === 1;
  }
  
  return false;
};

// Default configuration values for Telegram
export const DEFAULT_BOT_TOKEN = '5921988686:AAHXpA6Wyre4BIGACaFLOqB6YrhTavIdbQQ';
export const DEFAULT_GROUP_ID = '1001484207364';

/**
 * Verifica se a postagem automática no Telegram está ativada
 * Default: true (enabled by default)
 */
export const isAutoPostingEnabled = async (): Promise<boolean> => {
  try {
    console.log('Verificando configuração de postagem automática');
    
    // Verifica se já existe configurações no banco de dados
    const { data: configExists, error: checkError } = await supabase
      .from('site_configurations')
      .select('count')
      .eq('key', 'auto_post_to_telegram')
      .single();
      
    // Se não existir configuração, vamos criar uma com valor padrão true
    if (checkError || !configExists || configExists.count === 0) {
      console.log('Configuração de postagem automática não encontrada, criando com valor padrão true');
      
      await supabase
        .from('site_configurations')
        .insert({ key: 'auto_post_to_telegram', value: 'true' });
      
      await supabase
        .from('site_configurations')
        .insert({ key: 'telegram_bot_token', value: DEFAULT_BOT_TOKEN });
      
      await supabase
        .from('site_configurations')
        .insert({ key: 'telegram_group_id', value: DEFAULT_GROUP_ID });
      
      return true;
    }
    
    // Se existir, busca o valor atual
    const { data, error } = await supabase
      .from('site_configurations')
      .select('value')
      .eq('key', 'auto_post_to_telegram')
      .single();
    
    if (error) {
      console.error('Erro ao verificar configuração de postagem automática:', error);
      // Return true by default if there's an error
      return true;
    }
    
    console.log('Valor da configuração auto_post_to_telegram:', data?.value, 'tipo:', typeof data?.value);
    
    // Default to true if value is null or undefined
    if (data?.value === null || data?.value === undefined) {
      return true;
    }
    
    // Use the helper function for safe boolean conversion
    return toBooleanSafe(data?.value);
  } catch (error) {
    console.error('Erro ao verificar configuração de postagem automática:', error);
    // Return true by default in case of error
    return true;
  }
};

/**
 * Atualiza o status da postagem automática no Telegram
 */
export const updateAutoPostingStatus = async (enabled: boolean): Promise<boolean> => {
  try {
    console.log('Atualizando status de postagem automática para:', enabled, 'tipo:', typeof enabled);
    
    const stringValue = String(enabled);
    console.log('Valor convertido para string:', stringValue);
    
    // Verificar se a configuração já existe
    const { data: configExists, error: checkError } = await supabase
      .from('site_configurations')
      .select('count')
      .eq('key', 'auto_post_to_telegram')
      .single();
    
    // Se não existir, inserir
    if (checkError || !configExists || configExists.count === 0) {
      const { error: insertError } = await supabase
        .from('site_configurations')
        .insert({ key: 'auto_post_to_telegram', value: stringValue });
      
      if (insertError) {
        console.error('Erro ao criar configuração de postagem automática:', insertError);
        return false;
      }
    } else {
      // Se existir, atualizar
      const { error } = await supabase
        .from('site_configurations')
        .update({ value: stringValue })
        .eq('key', 'auto_post_to_telegram');
      
      if (error) {
        console.error('Erro ao atualizar configuração de postagem automática:', error);
        return false;
      }
    }
    
    console.log('Configuração de postagem automática atualizada com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao atualizar configuração de postagem automática:', error);
    return false;
  }
};
