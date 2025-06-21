import { SubscriptionData } from '@/types/subscriptionTypes';
import { supabase } from '@/integrations/supabase/client';
import { APP_VERSION } from '@/components/Version';

/**
 * Version 3.8.0
 * - Centralizada gestão de versão através do componente Version
 * - Removida duplicação de constante APP_VERSION
 * 
 * Version 3.0.8
 * - Implementada ordenação de assinaturas por data do mais recente para o mais antigo
 * - Refatoração para melhor organização do código
 * 
 * Version 3.0.7
 * - Adicionadas funções ausentes que estavam sendo importadas em outros arquivos
 * - Corrigidas as exportações para evitar erros de TypeScript
 * 
 * Version 3.0.6
 * - Adicionados emojis simples e compatíveis com WhatsApp
 * - Testado com emojis que funcionam corretamente na codificação URL
 * 
 * Version 3.0.5
 * - Removidos emojis para evitar problemas de codificação no WhatsApp
 * - Usado apenas texto simples que funciona em todas as plataformas
 * 
 * Version 3.0.4
 * - Corrigido problema de ícones usando emojis básicos compatíveis com WhatsApp
 * - Testados emojis que funcionam em todas as versões do WhatsApp
 * 
 * Version 3.0.3
 * - Corrigido definitivamente o problema de ícones no WhatsApp
 * - Usados ícones simples compatíveis com WhatsApp
 * 
 * Version 3.0.2
 * - Corrigido problema de codificação de ícones Unicode no WhatsApp
 * - Melhorada a codificação URL para preservar caracteres especiais
 * 
 * Version 3.0.1
 * - Corrigido problema de exibição de ícones no WhatsApp
 * - Ícones agora são exibidos corretamente no formato Unicode
 * 
 * Version 3.0.0
 * - Corrigido problema de envio de assinaturas aprovadas para o Telegram
 * 
 * Version 2.9.0
 * - Corrigido problema de envio duplicado para o Telegram
 * - Adicionada verificação para evitar envios repetidos
 * 
 * Version 2.8.0
 * - Adicionado suporte para botões inline no Telegram
 * - Implementada funcionalidade para excluir mensagens do Telegram
 * - Melhoradas as integrações de postagem automática
 * 
 * Version 2.7.0
 * - Improved Telegram integration reliability
 * - Fixed auto-posting functionality issues
 * - Added better configuration defaults
 * 
 * Version 2.6.0
 * - Added default auto-posting enabled
 * - Set default bot token and group ID
 * - Updated version display mechanism
 */

// Export the current version as a constant for use throughout the app
export { APP_VERSION } from '@/components/Version';

/**
 * Formats subscription data for sharing on messaging platforms
 */
export const formatSubscriptionForSharing = (subscription: SubscriptionData): string => {
  // Format the subscription data using simple emojis that work well in WhatsApp
  let content = '';
  
  // Title
  content += `📺 ${subscription.title}\n`;
  
  // Price
  content += `💰 ${subscription.price}\n`;
  
  // Payment method
  if (subscription.paymentMethod) {
    content += `💳 ${subscription.paymentMethod}\n`;
  }
  
  // Status
  content += `✅ ${subscription.status}\n`;
  
  // Access method
  content += `🔑 ${subscription.access}\n`;
  
  // Contact methods
  if (subscription.telegramUsername) {
    content += `📧 ${subscription.telegramUsername}\n`;
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
 * Using proper encoding to preserve Unicode characters
 */
export const getWhatsAppShareLink = (subscription: SubscriptionData): string => {
  const formattedText = formatSubscriptionForSharing(subscription);
  // Use encodeURIComponent to properly encode Unicode characters
  const encodedText = encodeURIComponent(formattedText);
  return `https://wa.me/?text=${encodedText}`;
};

/**
 * Creates a Telegram share link with formatted subscription data
 */
export const getTelegramShareLink = (subscription: SubscriptionData): string => {
  const formattedText = formatSubscriptionForSharing(subscription);
  const encodedText = encodeURIComponent(formattedText);
  return `https://t.me/share/url?url=&text=${encodedText}`;
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

/**
 * Verifica se uma assinatura já foi enviada para o Telegram
 * para evitar envios duplicados
 */
async function isSubscriptionAlreadySentToTelegram(subscriptionId: string): Promise<boolean> {
  try {
    // Verifica se já existe um registro de mensagem para esta assinatura
    const { data, error } = await supabase
      .from('telegram_messages')
      .select('message_id')
      .eq('subscription_id', subscriptionId)
      .maybeSingle();
    
    if (error) {
      console.error('Erro ao verificar se a assinatura já foi enviada:', error);
      return false;
    }
    
    return !!data?.message_id; // Retorna true se já foi enviada
  } catch (error) {
    console.error('Erro ao verificar envio anterior:', error);
    return false;
  }
}

/**
 * Sends a subscription to the Telegram group configured in settings
 */
export const sendToTelegramGroup = async (subscriptionId: string): Promise<{success: boolean, error?: string, messageId?: number}> => {
  try {
    console.log('Verificando se a assinatura já foi enviada:', subscriptionId);
    
    // Verifica se a assinatura já foi enviada anteriormente
    const alreadySent = await isSubscriptionAlreadySentToTelegram(subscriptionId);
    if (alreadySent) {
      console.log('Assinatura já foi enviada anteriormente, ignorando envio duplicado.');
      return { success: true, error: "Assinatura já foi enviada anteriormente." };
    }
    
    console.log('Enviando assinatura ao grupo do Telegram:', subscriptionId);
    
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
    
    console.log('Assinatura enviada com sucesso para o grupo do Telegram', data);
    
    // Armazenar o ID da mensagem para referência futura
    if (data.messageId) {
      await storeMessageId(subscriptionId, data.messageId);
    }
    
    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error('Erro enviando para o Telegram:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido ao enviar para o Telegram'
    };
  }
};

/**
 * Exclui uma mensagem do grupo do Telegram
 */
export const deleteFromTelegramGroup = async (subscriptionId: string): Promise<{success: boolean, error?: string}> => {
  try {
    // Primeiro, obtemos o ID da mensagem do Telegram associada a esta assinatura
    const { data: messageData } = await supabase
      .from('telegram_messages')
      .select('message_id')
      .eq('subscription_id', subscriptionId)
      .maybeSingle();
    
    if (!messageData?.message_id) {
      console.log('Nenhum ID de mensagem encontrado para esta assinatura. Nada a excluir do Telegram.');
      return { success: true };
    }
    
    console.log('Excluindo mensagem do grupo do Telegram:', messageData.message_id);
    
    const { data, error } = await supabase.functions.invoke('telegram-integration', {
      body: {
        action: 'delete-message',
        messageId: messageData.message_id
      }
    });
    
    if (error) {
      console.error('Erro na função edge do Telegram:', error);
      throw new Error(error.message || 'Falha ao excluir mensagem do grupo do Telegram');
    }
    
    if (!data?.success) {
      console.error('Erro ao excluir mensagem do Telegram:', data?.error);
      throw new Error(data?.error || 'Falha ao excluir mensagem do grupo do Telegram');
    }
    
    console.log('Mensagem excluída com sucesso do grupo do Telegram');
    
    // Remover o registro do ID da mensagem do banco de dados
    await supabase
      .from('telegram_messages')
      .delete()
      .eq('subscription_id', subscriptionId);
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao excluir do Telegram:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido ao excluir do Telegram'
    };
  }
};

/**
 * Armazena o ID da mensagem do Telegram para referência futura
 */
async function storeMessageId(subscriptionId: string, messageId: number) {
  try {
    // Verificar se já existe um registro para esta assinatura
    const { data: existingRecord } = await supabase
      .from('telegram_messages')
      .select('id')
      .eq('subscription_id', subscriptionId)
      .maybeSingle();
    
    if (existingRecord) {
      // Atualizar o registro existente
      await supabase
        .from('telegram_messages')
        .update({ message_id: messageId })
        .eq('subscription_id', subscriptionId);
    } else {
      // Criar um novo registro
      await supabase
        .from('telegram_messages')
        .insert({
          subscription_id: subscriptionId,
          message_id: messageId,
          sent_at: new Date().toISOString()
        });
    }
    
    console.log('ID da mensagem do Telegram armazenado com sucesso');
  } catch (error) {
    console.error('Erro ao armazenar ID da mensagem do Telegram:', error);
  }
}

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
    
    // Usar upsert para inserir ou atualizar
    const { error } = await supabase
      .from('site_configurations')
      .upsert(
        { key: 'auto_post_to_telegram', value: stringValue },
        { onConflict: 'key' }
      );
    
    if (error) {
      console.error('Erro ao atualizar configuração de postagem automática:', error);
      return false;
    }
    
    console.log('Configuração de postagem automática atualizada com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao atualizar configuração de postagem automática:', error);
    return false;
  }
};
