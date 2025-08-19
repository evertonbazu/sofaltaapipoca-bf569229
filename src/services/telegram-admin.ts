import { supabase } from '@/integrations/supabase/client';

/**
 * Serviços para gerenciamento administrativo do Telegram
 * @version 3.9.7
 */

export interface TelegramMessage {
  id: string;
  message_id: number;
  subscription_id: string;
  sent_at: string;
  deleted_at?: string;
  subscription?: {
    title: string;
    customTitle?: string;
    price: string;
    status: string;
    code: string;
    visible: boolean;
  };
}

/**
 * Busca todas as mensagens do Telegram com dados das assinaturas
 */
export async function getTelegramMessages(): Promise<TelegramMessage[]> {
  const { data, error } = await supabase
    .from('telegram_messages')
    .select(`
      id,
      message_id,
      subscription_id,
      sent_at,
      deleted_at,
      subscriptions!inner (
        title,
        custom_title,
        price,
        status,
        code,
        visible
      )
    `)
    .order('sent_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar mensagens do Telegram:', error);
    throw new Error('Erro ao carregar mensagens do Telegram');
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    message_id: item.message_id,
    subscription_id: item.subscription_id,
    sent_at: item.sent_at,
    deleted_at: item.deleted_at,
    subscription: item.subscriptions ? {
      title: item.subscriptions.title,
      customTitle: item.subscriptions.custom_title,
      price: item.subscriptions.price,
      status: item.subscriptions.status,
      code: item.subscriptions.code,
      visible: item.subscriptions.visible
    } : undefined
  }));
}

/**
 * Exclui uma mensagem do Telegram
 */
export async function deleteTelegramMessage(messageId: number): Promise<void> {
  const { error } = await supabase.functions.invoke('telegram-integration', {
    body: {
      action: 'delete-message',
      messageId: messageId
    }
  });

  if (error) {
    console.error('Erro ao excluir mensagem do Telegram:', error);
    throw new Error('Erro ao excluir mensagem do Telegram');
  }
}

/**
 * Edita uma mensagem do Telegram
 */
export async function editTelegramMessage(messageId: number, newText: string): Promise<void> {
  const { error } = await supabase.functions.invoke('telegram-integration', {
    body: {
      action: 'edit-message',
      messageId: messageId,
      text: newText
    }
  });

  if (error) {
    console.error('Erro ao editar mensagem do Telegram:', error);
    throw new Error('Erro ao editar mensagem do Telegram');
  }
}

/**
 * Edita uma mensagem do Telegram com formatação completa e botões
 */
export async function editTelegramMessageFormatted(messageId: number, subscriptionId: string): Promise<void> {
  const { error } = await supabase.functions.invoke('telegram-integration', {
    body: {
      action: 'edit-message-formatted',
      messageId: messageId,
      subscriptionId: subscriptionId
    }
  });

  if (error) {
    console.error('Erro ao editar mensagem formatada do Telegram:', error);
    throw new Error('Erro ao editar mensagem formatada do Telegram');
  }
}

/**
 * Republica uma assinatura no Telegram
 */
export async function repostSubscription(subscriptionId: string): Promise<void> {
  const { error } = await supabase.functions.invoke('telegram-integration', {
    body: {
      action: 'send-subscription',
      subscriptionId: subscriptionId
    }
  });

  if (error) {
    console.error('Erro ao republicar assinatura:', error);
    throw new Error('Erro ao republicar assinatura');
  }
}