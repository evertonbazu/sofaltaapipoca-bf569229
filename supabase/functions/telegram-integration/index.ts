
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Configurações CORS para permitir chamadas da aplicação web
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Formatar assinatura para compartilhamento
function formatSubscriptionForSharing(subscription: any): string {
  let content = '';
  
  // Título com ícone
  content += `${subscription.icon || '🖥'} ${subscription.title}\n`;
  
  // Preço
  content += `🏦 ${subscription.price}\n`;
  
  // Status
  content += `📌 ${subscription.status}\n`;
  
  // Método de acesso
  content += `🔐 ${subscription.access}\n`;
  
  // Métodos de contato
  if (subscription.telegram_username) {
    content += `📩 ${subscription.telegram_username}\n`;
  }
  
  if (subscription.whatsapp_number) {
    content += `📱 https://wa.me/${subscription.whatsapp_number}\n`;
  }
  
  // Data de adição
  if (subscription.added_date) {
    content += `\n📅 Adicionado em: ${subscription.added_date}`;
  }
  
  // Código da assinatura
  if (subscription.code) {
    content += `\n🔑 Código: ${subscription.code}`;
  }
  
  // Nota que foi postado automaticamente
  content += `\n\n✨ Enviado automaticamente por SóFaltaAPipoca`;
  
  return content;
}

// Enviar mensagem para o Telegram
async function sendTelegramMessage(botToken: string, chatId: string, text: string) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API error:', errorData);
      return {
        success: false,
        error: `Telegram API error: ${errorData.description || 'Unknown error'}`
      };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Obter configuração do site
async function getSiteConfig(supabase: any, key: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('site_configurations')
    .select('value')
    .eq('key', key)
    .single();
  
  if (error) {
    console.error(`Error getting site config ${key}:`, error);
    return null;
  }
  
  return data?.value || null;
}

// Handler da função edge
serve(async (req) => {
  // Tratamento de CORS para requisições OPTIONS
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  try {
    // Cria cliente do Supabase com a URL e a chave anon do projeto
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Obter dados da requisição
    let requestData;
    if (req.method === 'POST') {
      requestData = await req.json();
    }

    // Rota para enviar mensagem de teste
    if (req.url.includes('/send-telegram-test')) {
      const { botToken, groupId } = requestData;
      
      if (!botToken || !groupId) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Token do bot e ID do grupo são obrigatórios' 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      const testMessage = `🧪 Mensagem de teste da integração SóFaltaAPipoca\n\n✅ Sua integração com o Telegram está funcionando corretamente!\n\n⏱️ Enviado em: ${new Date().toLocaleString('pt-BR')}`;
      
      const result = await sendTelegramMessage(botToken, groupId, testMessage);
      
      return new Response(
        JSON.stringify(result),
        {
          status: result.success ? 200 : 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Rota para enviar uma assinatura específica
    if (req.url.includes('/send-subscription')) {
      // Verificar se o envio automático está ativado
      const autoPostEnabled = await getSiteConfig(supabase, 'auto_post_to_telegram');
      
      if (autoPostEnabled !== 'true') {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Envio automático para o Telegram está desativado' 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      // Obter token e ID do grupo das configurações
      const botToken = await getSiteConfig(supabase, 'telegram_bot_token');
      const groupId = await getSiteConfig(supabase, 'telegram_group_id');
      
      if (!botToken || !groupId) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Token do bot ou ID do grupo não configurados' 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      // Obter ID da assinatura e buscar dados
      const { subscriptionId } = requestData;
      
      if (!subscriptionId) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'ID da assinatura é obrigatório' 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      // Buscar dados da assinatura
      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .single();
      
      if (subscriptionError || !subscription) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Assinatura não encontrada' 
          }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      // Formatar e enviar mensagem
      const formattedMessage = formatSubscriptionForSharing(subscription);
      const result = await sendTelegramMessage(botToken, groupId, formattedMessage);
      
      // Registrar o envio
      if (result.success) {
        await supabase
          .from('error_logs') // Usando a tabela de logs existente para registrar eventos
          .insert({
            error_message: 'Telegram message sent successfully',
            error_context: `Subscription ID: ${subscriptionId}`,
            error_code: 'telegram_success',
            stack_trace: JSON.stringify({ subscription_title: subscription.title })
          });
      }
      
      return new Response(
        JSON.stringify(result),
        {
          status: result.success ? 200 : 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Rota padrão - documentação
    return new Response(
      JSON.stringify({
        message: 'Telegram Integration API',
        endpoints: [
          '/send-telegram-test - Send a test message',
          '/send-subscription - Send a subscription to Telegram'
        ]
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Unhandled error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown server error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
