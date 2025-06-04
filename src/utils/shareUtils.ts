
import { SubscriptionData } from '@/types/subscriptionTypes';
import { supabase } from '@/integrations/supabase/client';

/**
 * Version 2.3.1
 * - Adicionada ordenação por data nas assinaturas da tela inicial
 * - Criados utilitários de data para ordenação consistente
 * 
 * Version 2.3.0
 * - Versão atualizada após reversão para commit anterior
 * 
 * Version 3.0.6
 * - Adicionados emojis simples e compatíveis com WhatsApp
 * - Testado com emojis que funcionam corretamente na codificação URL
 * - Mantida compatibilidade com Telegram
 * 
 * Version 3.0.5
 * - Removida validação desnecessária de configuração
 * - Corrigida função isAutoPostingEnabled para verificar apenas a configuração
 * - Simplificada lógica de verificação de postagem automática
 * 
 * Version 3.0.4
 * - Corrigido parâmetro onConflict que deve ser string, não array
 * - Melhorada função ensureDefaultConfig para usar upsert corretamente
 * 
 * Version 3.0.3
 * - Corrigidas funções sendToTelegramGroup e deleteFromTelegramGroup
 * - Adicionada função isAutoPostingEnabled para verificar configuração
 * - Melhorada integração com Telegram
 * 
 * Version 3.0.2
 * - Adicionadas funções de compartilhamento para WhatsApp e Telegram
 * - Melhorada formatação de mensagens com emojis compatíveis
 * - Corrigida codificação de URLs para evitar problemas com caracteres especiais
 * 
 * Version 3.0.1
 * - Adicionado sistema de compartilhamento automático via Telegram
 * - Integração com edge function para envio de mensagens
 * - Suporte a configurações dinâmicas para URLs e tokens
 * 
 * Version 3.0.0
 * - Refatorado sistema de compartilhamento
 * - Melhorada formatação de mensagens
 * - Adicionado suporte a múltiplas plataformas
 */

// Export the current version as a constant for use throughout the app
export const APP_VERSION = "2.3.1";

const telegramApiUrl = process.env.NEXT_PUBLIC_TELEGRAM_API_URL;
const telegramBotToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
const telegramChatId = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;
const edgeFunctionUrl = process.env.NEXT_PUBLIC_EDGE_FUNCTION_URL;

async function ensureDefaultConfig(key: string, defaultValue: string, description: string) {
  try {
    const { data, error } = await supabase
      .from('site_configurations')
      .upsert(
        { key: key, value: defaultValue, description: description },
        { onConflict: 'key' }
      );

    if (error) {
      console.error(`Erro ao inserir/atualizar configuração padrão ${key}:`, error);
    } else {
      console.log(`Configuração padrão ${key} verificada/atualizada com sucesso.`);
    }
  } catch (error) {
    console.error(`Erro ao inserir/atualizar configuração padrão ${key}:`, error);
  }
}

export async function sendToTelegramGroup(subscriptionId: string): Promise<any> {
    try {
        if (!telegramApiUrl || !telegramBotToken || !telegramChatId || !edgeFunctionUrl) {
            console.warn("Variáveis de ambiente do Telegram não configuradas.");
            return { success: false, message: "Telegram não configurado." };
        }

        // Buscar os dados da assinatura no Supabase
        const { data: subscription, error: subscriptionError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('id', subscriptionId)
            .single();

        if (subscriptionError) {
            console.error("Erro ao buscar detalhes da assinatura:", subscriptionError);
            return { success: false, message: "Erro ao buscar detalhes da assinatura." };
        }

        if (!subscription) {
            console.warn("Assinatura não encontrada com ID:", subscriptionId);
            return { success: false, message: "Assinatura não encontrada." };
        }

        // Formatar a mensagem com emojis e quebras de linha
        const message = `
🎉 Nova assinatura adicionada! 🎉

Título: ${subscription.title}
Preço: ${subscription.price}
Forma de Pagamento: ${subscription.payment_method}
Status: ${subscription.status}
Envio: ${subscription.access}

Entre em contato:
📱 WhatsApp: ${subscription.whatsapp_number || 'Não informado'}
📩 Telegram: ${subscription.telegram_username ? `@${subscription.telegram_username}` : 'Não informado'}
        `;

        // Codificar a mensagem para a URL
        const encodedMessage = encodeURIComponent(message);

  const functionURL = `${edgeFunctionUrl}?subscriptionId=${subscriptionId}&message=${encodedMessage}`;

        // Enviar a mensagem usando a Edge Function
        const response = await fetch(functionURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const result = await response.json();

        if (result.success) {
            console.log("Mensagem enviada para o Telegram com sucesso!");
            return { success: true, message: "Mensagem enviada para o Telegram com sucesso!" };
        } else {
            console.error("Falha ao enviar mensagem para o Telegram:", result.message);
            return { success: false, message: "Falha ao enviar mensagem para o Telegram." };
        }

    } catch (error: any) {
        console.error("Erro ao enviar mensagem para o Telegram:", error);
        return { success: false, message: "Erro ao enviar mensagem para o Telegram." };
    }
}

export async function deleteFromTelegramGroup(subscriptionId: string): Promise<any> {
    try {
        if (!telegramApiUrl || !telegramBotToken || !telegramChatId || !edgeFunctionUrl) {
            console.warn("Variáveis de ambiente do Telegram não configuradas.");
            return { success: false, message: "Telegram não configurado." };
        }

        // Buscar o código da mensagem no Supabase
        const { data: subscription, error: subscriptionError } = await supabase
            .from('subscriptions')
            .select('code')
            .eq('id', subscriptionId)
            .single();

        if (subscriptionError) {
            console.error("Erro ao buscar código da assinatura:", subscriptionError);
            return { success: false, message: "Erro ao buscar código da assinatura." };
        }

        if (!subscription || !subscription.code) {
            console.warn("Código da assinatura não encontrado para o ID:", subscriptionId);
            return { success: false, message: "Código da assinatura não encontrado." };
        }

        // Usar o código da assinatura como message_id
        const messageId = subscription.code;

        const deleteURL = `${telegramApiUrl}/bot${telegramBotToken}/deleteMessage?chat_id=${telegramChatId}&message_id=${messageId}`;

        // Enviar a solicitação para excluir a mensagem
        const response = await fetch(deleteURL, {
            method: 'POST',
        });

        const result = await response.json();

        if (result.ok) {
            console.log(`Mensagem ${messageId} excluída do Telegram com sucesso!`);
            return { success: true, message: `Mensagem ${messageId} excluída do Telegram com sucesso!` };
        } else {
            console.error(`Falha ao excluir mensagem ${messageId} do Telegram:`, result);
            return { success: false, message: `Falha ao excluir mensagem ${messageId} do Telegram.` };
        }

    } catch (error: any) {
        console.error("Erro ao excluir mensagem do Telegram:", error);
        return { success: false, message: "Erro ao excluir mensagem do Telegram." };
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
      console.error("Erro ao verificar configuração de auto_post_to_telegram:", error);
      return false;
    }

    if (!data) {
      console.warn("Configuração auto_post_to_telegram não encontrada, desativando.");
      return false;
    }

    return data.value === 'true';
  } catch (error) {
    console.error("Erro ao verificar configuração de auto_post_to_telegram:", error);
    return false;
  }
}

// Função para gerar links de compartilhamento do WhatsApp
export function getWhatsAppShareLink(subscription: SubscriptionData): string {
  const message = `
🎉 *${subscription.title}*

💰 Preço: *${subscription.price}*
🔄 Forma de Pagamento: ${subscription.paymentMethod}
📊 Status: ${subscription.status}
🔐 Acesso: ${subscription.access}

Entre em contato comigo para mais informações!
  `.trim();

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/?text=${encodedMessage}`;
}

// Função para gerar links de compartilhamento do Telegram
export function getTelegramShareLink(subscription: SubscriptionData): string {
  const message = `
🎉 *${subscription.title}*

💰 Preço: *${subscription.price}*
🔄 Forma de Pagamento: ${subscription.paymentMethod}
📊 Status: ${subscription.status}
🔐 Acesso: ${subscription.access}

Entre em contato comigo para mais informações!
  `.trim();

  const encodedMessage = encodeURIComponent(message);
  return `https://t.me/share/url?text=${encodedMessage}`;
}

// Função para conversão segura para booleano
export function toBooleanSafe(value: any): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return Boolean(value);
}

// Função para atualizar status de postagem automática
export async function updateAutoPostingStatus(enabled: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('site_configurations')
      .upsert(
        { 
          key: 'auto_post_to_telegram', 
          value: enabled.toString(), 
          description: 'Configuração para postagem automática no Telegram' 
        },
        { onConflict: 'key' }
      );

    if (error) {
      console.error('Erro ao atualizar configuração de postagem automática:', error);
      return false;
    }

    console.log('Configuração de postagem automática atualizada com sucesso:', enabled);
    return true;
  } catch (error) {
    console.error('Erro ao atualizar configuração de postagem automática:', error);
    return false;
  }
}
