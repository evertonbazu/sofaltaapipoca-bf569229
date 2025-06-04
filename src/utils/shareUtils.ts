import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const TELEGRAM_BOT_NAME = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME;
export const TELEGRAM_GROUP_ID = process.env.NEXT_PUBLIC_TELEGRAM_GROUP_ID;
export const APP_VERSION = '3.0.7';

export async function sendToTelegramGroup(subscriptionId: string): Promise<any> {
  try {
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single();

    if (subscriptionError) {
      console.error("Erro ao buscar detalhes da assinatura:", subscriptionError);
      throw new Error(`Failed to fetch subscription details: ${subscriptionError.message}`);
    }

    if (!subscription) {
      console.error("Assinatura não encontrada com o ID:", subscriptionId);
      throw new Error(`Subscription not found with ID: ${subscriptionId}`);
    }

    const message = `📣 Nova assinatura adicionada!\n\n` +
      `Título: ${subscription.title}\n` +
      `Preço: ${subscription.price}\n` +
      `Forma de Pagamento: ${subscription.payment_method}\n` +
      `Status: ${subscription.status}\n` +
      `Acesso: ${subscription.access}\n\n` +
      `Entre em contato:\n` +
      (subscription.telegram_username ? `Telegram: @${subscription.telegram_username}\n` : '') +
      (subscription.whatsapp_number ? `WhatsApp: ${subscription.whatsapp_number}\n` : '');

    const botToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const chatId = process.env.NEXT_PUBLIC_TELEGRAM_GROUP_ID;
    const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Erro ao enviar mensagem para o Telegram:", responseData);
      throw new Error(`Failed to send message to Telegram: ${responseData.description}`);
    }

    // Salvar o ID da mensagem no banco de dados
    const { error: saveError } = await supabase
      .from('subscriptions')
      .update({ telegram_message_id: responseData.result.message_id })
      .eq('id', subscriptionId);

    if (saveError) {
      console.error("Erro ao salvar o ID da mensagem no banco de dados:", saveError);
      toast({
        title: "Erro ao salvar o ID da mensagem no banco de dados.",
        description: "A mensagem foi enviada para o Telegram, mas não foi possível salvar o ID da mensagem.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Assinatura enviada para o Telegram!",
        description: "A mensagem foi enviada com sucesso para o grupo do Telegram.",
      });
    }

    return responseData;
  } catch (error: any) {
    console.error("Erro ao enviar para o Telegram:", error);
    toast({
      title: "Erro ao enviar para o Telegram.",
      description: error.message || "Ocorreu um erro ao enviar a mensagem para o Telegram.",
      variant: "destructive",
    });
    throw error;
  }
}

export async function deleteFromTelegramGroup(subscriptionId: string): Promise<any> {
  try {
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('telegram_message_id')
      .eq('id', subscriptionId)
      .single();

    if (subscriptionError) {
      console.error("Erro ao buscar ID da mensagem do Telegram:", subscriptionError);
      throw new Error(`Failed to fetch Telegram message ID: ${subscriptionError.message}`);
    }

    if (!subscription || !subscription.telegram_message_id) {
      console.log("ID da mensagem do Telegram não encontrado para a assinatura:", subscriptionId);
      return { success: true, message: "Telegram message ID not found, no deletion needed." };
    }

    const botToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const chatId = process.env.NEXT_PUBLIC_TELEGRAM_GROUP_ID;
    const messageId = subscription.telegram_message_id;
    const apiUrl = `https://api.telegram.org/bot${botToken}/deleteMessage`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Erro ao excluir mensagem do Telegram:", responseData);
      throw new Error(`Failed to delete message from Telegram: ${responseData.description}`);
    }

    // Limpar o ID da mensagem do Telegram no banco de dados
    const { error: clearError } = await supabase
      .from('subscriptions')
      .update({ telegram_message_id: null })
      .eq('id', subscriptionId);

    if (clearError) {
      console.error("Erro ao limpar o ID da mensagem do Telegram no banco de dados:", clearError);
      toast({
        title: "Erro ao limpar o ID da mensagem do Telegram no banco de dados.",
        description: "A mensagem foi excluída do Telegram, mas não foi possível limpar o ID da mensagem no banco de dados.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Mensagem excluída do Telegram!",
        description: "A mensagem foi excluída com sucesso do grupo do Telegram.",
      });
    }

    return responseData;
  } catch (error: any) {
    console.error("Erro ao excluir do Telegram:", error);
    toast({
      title: "Erro ao excluir do Telegram.",
      description: error.message || "Ocorreu um erro ao excluir a mensagem do Telegram.",
      variant: "destructive",
    });
    throw error;
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
      console.error("Erro ao verificar se o envio automático está habilitado:", error);
      return false; // Retorna false em caso de erro para desabilitar o envio automático
    }

    return data?.value === 'true';
  } catch (error) {
    console.error("Erro ao verificar se o envio automático está habilitado:", error);
    return false; // Retorna false em caso de erro para desabilitar o envio automático
  }
}
