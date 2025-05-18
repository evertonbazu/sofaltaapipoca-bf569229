
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função para formatar o conteúdo de uma assinatura para o Telegram
function formatSubscriptionForTelegram(subscription: any) {
  let content = '';
  
  // Title with icon
  content += `${subscription.icon || '🖥'} ${subscription.title}\n`;
  
  // Price
  content += `🏦 ${subscription.price}\n`;
  
  // Payment method (always include)
  content += `🤝🏼 ${subscription.payment_method}\n`;
  
  // Status
  content += `📌 ${subscription.status}\n`;
  
  // Access method
  content += `🔐 ${subscription.access}\n`;
  
  // Contact methods
  if (subscription.telegram_username) {
    content += `📩 ${subscription.telegram_username}\n`;
  }
  
  if (subscription.whatsapp_number) {
    content += `📱 https://wa.me/${subscription.whatsapp_number}\n`;
  }
  
  // Date added
  if (subscription.added_date) {
    content += `\n📅 Adicionado em: ${subscription.added_date}`;
  }
  
  return content;
}

// Função auxiliar para enviar mensagem para o Telegram
async function sendTelegramMessage(botToken: string, chatId: string, text: string) {
  console.log(`Sending message to Telegram. Chat ID: ${chatId}`);
  
  // Ensure chatId is properly formatted for supergroups
  let formattedChatId = chatId;
  if (chatId.startsWith('100') && !chatId.startsWith('-100')) {
    // If it's a numeric group ID that starts with 100 but not with -100, add the hyphen
    formattedChatId = `-${chatId}`;
  } else if (!chatId.startsWith('-') && !chatId.startsWith('@')) {
    // If it's a numeric group ID without the hyphen, add it with -100 prefix
    formattedChatId = `-100${chatId}`;
  }
  
  const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: formattedChatId,
      text: text,
      parse_mode: 'HTML'
    })
  };
  
  try {
    const response = await fetch(apiUrl, options);
    const responseData = await response.json();
    
    console.log('Telegram API response:', JSON.stringify(responseData));
    
    if (!responseData.ok) {
      throw new Error(`Telegram API error: ${responseData.description}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    throw error;
  }
}

// Função para obter as configurações do Telegram do banco de dados
async function getTelegramConfig() {
  try {
    // Get bot token
    const { data: tokenData, error: tokenError } = await supabase
      .from('site_configurations')
      .select('value')
      .eq('key', 'telegram_bot_token')
      .maybeSingle();
      
    if (tokenError) throw new Error(`Failed to get bot token: ${tokenError.message}`);
    if (!tokenData?.value) throw new Error('Telegram bot token not configured');
    
    // Get group ID
    const { data: groupData, error: groupError } = await supabase
      .from('site_configurations')
      .select('value')
      .eq('key', 'telegram_group_id')
      .maybeSingle();
      
    if (groupError) throw new Error(`Failed to get group ID: ${groupError.message}`);
    if (!groupData?.value) throw new Error('Telegram group ID not configured');
    
    // Get auto-post setting
    const { data: autoPostData, error: autoPostError } = await supabase
      .from('site_configurations')
      .select('value')
      .eq('key', 'auto_post_to_telegram')
      .maybeSingle();
    
    let autoPost = false;
    if (!autoPostError && autoPostData?.value) {
      autoPost = autoPostData.value === 'true';
    }
    
    return {
      botToken: tokenData.value,
      groupId: groupData.value,
      autoPost
    };
  } catch (error) {
    console.error('Error fetching Telegram config:', error);
    throw error;
  }
}

// Endpoint para o serviço de integração com o Telegram
Deno.serve(async (req) => {
  // Verificar se é uma requisição OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { action, botToken, groupId, subscriptionId } = await req.json();
    
    // Teste de envio - usa os parâmetros fornecidos diretamente
    if (action === 'send-telegram-test') {
      if (!botToken) {
        throw new Error('Token do bot não fornecido');
      }
      
      if (!groupId) {
        throw new Error('ID do grupo não fornecido');
      }
      
      const currentDate = new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      
      const testMessage = `🧪 Test message from SóFaltaAPipoca integration

✅ Your Telegram integration is working correctly!

⏱️ Sent at: ${currentDate}`;
      
      try {
        await sendTelegramMessage(botToken, groupId, testMessage);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Error in test message:', error);
        return new Response(JSON.stringify({ 
          success: false, 
          error: `Falha ao enviar mensagem de teste: ${error.message}` 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 // Retorna 200 mesmo com erro para facilitar o tratamento no frontend
        });
      }
    }
    
    // Envio de uma assinatura específica
    if (action === 'send-subscription') {
      if (!subscriptionId) {
        throw new Error('ID da assinatura não fornecido');
      }
      
      // Obter a configuração do Telegram
      const config = await getTelegramConfig();
      
      // Obter os detalhes da assinatura
      const { data: subscription, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .maybeSingle();
      
      if (fetchError) {
        throw new Error(`Erro ao buscar assinatura: ${fetchError.message}`);
      }
      
      if (!subscription) {
        throw new Error('Assinatura não encontrada');
      }
      
      // Formatar e enviar a mensagem
      const message = formatSubscriptionForTelegram(subscription);
      await sendTelegramMessage(config.botToken, config.groupId, message);
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Ação não reconhecida
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Ação não reconhecida' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
    
  } catch (error) {
    console.error('Error in Telegram integration:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: `Erro na integração do Telegram: ${error.message}` 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
