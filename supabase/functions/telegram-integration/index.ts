
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0';
import { corsHeaders } from '../_shared/cors.ts';

/**
 * Version 2.6.0
 * - Set default bot token and group ID
 * - Improved auto-posting logic and error handling
 * 
 * Version 2.2.0
 * - Improved group ID formatting
 * - Added better error handling and logging
 */

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Defaults values
const DEFAULT_BOT_TOKEN = '5921988686:AAHXpA6Wyre4BIGACaFLOqB6YrhTavIdbQQ';
const DEFAULT_GROUP_ID = '1001484207364';

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

// Função auxiliar para formatar corretamente o ID do grupo
function formatChatId(chatId: string): string {
  console.log(`Formatting chat ID: '${chatId}'`);
  
  // Remover espaços
  let formattedChatId = chatId.trim();
  
  // Se o ID já começar com -100, mantém como está
  if (formattedChatId.startsWith('-100')) {
    console.log(`Chat ID already in correct format: ${formattedChatId}`);
    return formattedChatId;
  }
  
  // Se o ID começar com -, mas não com -100, verificamos o formato
  if (formattedChatId.startsWith('-')) {
    if (formattedChatId.substring(1).startsWith('100')) {
      // Já tem o formato -100, então mantemos
      console.log(`Chat ID already in format -100: ${formattedChatId}`);
      return formattedChatId;
    } else {
      // Tem - mas não tem 100, então adicionamos o 100
      formattedChatId = `-100${formattedChatId.substring(1)}`;
      console.log(`Added -100 prefix, new chat ID: ${formattedChatId}`);
      return formattedChatId;
    }
  }
  
  // Verificamos se começa com @ (username do canal)
  if (formattedChatId.startsWith('@')) {
    console.log(`Chat ID is a username: ${formattedChatId}`);
    return formattedChatId;
  }
  
  // Se começar com 100, adicionamos apenas o -
  if (formattedChatId.startsWith('100')) {
    formattedChatId = `-${formattedChatId}`;
    console.log(`Added hyphen prefix, new chat ID: ${formattedChatId}`);
    return formattedChatId;
  }
  
  // Para outros casos numéricos, adicionamos -100
  if (/^\d+$/.test(formattedChatId)) {
    formattedChatId = `-100${formattedChatId}`;
    console.log(`Added -100 prefix to numeric ID, new chat ID: ${formattedChatId}`);
    return formattedChatId;
  }
  
  // Retorna o ID original caso não se encaixe em nenhuma regra
  return formattedChatId;
}

// Função auxiliar para enviar mensagem para o Telegram
async function sendTelegramMessage(botToken: string, chatId: string, text: string) {
  const formattedChatId = formatChatId(chatId);
  console.log(`Sending message to Telegram. Chat ID: ${formattedChatId}`);
  
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
    console.log(`Making request to Telegram API: ${apiUrl}`);
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

// Função para obter ou criar as configurações do Telegram do banco de dados
async function getTelegramConfig() {
  try {
    // Verifica e possivelmente cria configurações padrão
    await ensureDefaultConfigurations();
    
    // Get bot token
    const { data: tokenData, error: tokenError } = await supabase
      .from('site_configurations')
      .select('value')
      .eq('key', 'telegram_bot_token')
      .maybeSingle();
      
    const botToken = tokenData?.value || DEFAULT_BOT_TOKEN;
    if (tokenError) {
      console.log(`Failed to get bot token, using default: ${DEFAULT_BOT_TOKEN}`);
    }
    
    // Get group ID
    const { data: groupData, error: groupError } = await supabase
      .from('site_configurations')
      .select('value')
      .eq('key', 'telegram_group_id')
      .maybeSingle();
      
    const groupId = groupData?.value || DEFAULT_GROUP_ID;
    if (groupError) {
      console.log(`Failed to get group ID, using default: ${DEFAULT_GROUP_ID}`);
    }
    
    // Get auto-post setting - default to true if not found
    const { data: autoPostData, error: autoPostError } = await supabase
      .from('site_configurations')
      .select('value')
      .eq('key', 'auto_post_to_telegram')
      .maybeSingle();
    
    let autoPost = true; // Default to true
    if (!autoPostError && autoPostData?.value !== undefined && autoPostData?.value !== null) {
      const value = autoPostData.value;
      autoPost = value === 'true' || value === true;
      console.log(`Auto post setting: ${value} (${typeof value}) -> ${autoPost}`);
    } else {
      console.log('Auto post setting not found or error, defaulting to true');
    }
    
    return {
      botToken,
      groupId,
      autoPost
    };
  } catch (error) {
    console.error('Error fetching Telegram config:', error);
    // Use defaults if there was an error
    return {
      botToken: DEFAULT_BOT_TOKEN,
      groupId: DEFAULT_GROUP_ID,
      autoPost: true
    };
  }
}

// Garantir que as configurações padrão existem no banco
async function ensureDefaultConfigurations() {
  try {
    // Verificar token do bot
    const { data: tokenData, error: tokenError } = await supabase
      .from('site_configurations')
      .select('count')
      .eq('key', 'telegram_bot_token')
      .single();
    
    if (tokenError || !tokenData || tokenData.count === 0) {
      console.log('Creating default bot token configuration');
      await supabase
        .from('site_configurations')
        .insert({ key: 'telegram_bot_token', value: DEFAULT_BOT_TOKEN });
    }
    
    // Verificar ID do grupo
    const { data: groupData, error: groupError } = await supabase
      .from('site_configurations')
      .select('count')
      .eq('key', 'telegram_group_id')
      .single();
    
    if (groupError || !groupData || groupData.count === 0) {
      console.log('Creating default group ID configuration');
      await supabase
        .from('site_configurations')
        .insert({ key: 'telegram_group_id', value: DEFAULT_GROUP_ID });
    }
    
    // Verificar configuração de auto-posting
    const { data: autoPostData, error: autoPostError } = await supabase
      .from('site_configurations')
      .select('count')
      .eq('key', 'auto_post_to_telegram')
      .single();
    
    if (autoPostError || !autoPostData || autoPostData.count === 0) {
      console.log('Creating default auto-posting configuration (true)');
      await supabase
        .from('site_configurations')
        .insert({ key: 'auto_post_to_telegram', value: 'true' });
    }
  } catch (error) {
    console.error('Error ensuring default configurations:', error);
  }
}

// Endpoint para o serviço de integração com o Telegram
Deno.serve(async (req) => {
  // Verificar se é uma requisição OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Garantir que as configurações padrão existem
    await ensureDefaultConfigurations();
    
    const { action, botToken, groupId, subscriptionId } = await req.json();
    console.log(`Received request with action: ${action}`);
    
    // Teste de envio - usa os parâmetros fornecidos diretamente
    if (action === 'send-telegram-test') {
      console.log('Processing send-telegram-test action');
      
      // Usa o token fornecido ou o padrão se não fornecido
      const tokenToUse = botToken || DEFAULT_BOT_TOKEN;
      if (!tokenToUse) {
        throw new Error('Token do bot não fornecido');
      }
      
      // Usa o ID do grupo fornecido ou o padrão se não fornecido
      const groupIdToUse = groupId || DEFAULT_GROUP_ID;
      if (!groupIdToUse) {
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
        await sendTelegramMessage(tokenToUse, groupIdToUse, testMessage);
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
      console.log('Processing send-subscription action for ID:', subscriptionId);
      
      if (!subscriptionId) {
        throw new Error('ID da assinatura não fornecido');
      }
      
      // Obter a configuração do Telegram
      const config = await getTelegramConfig();
      console.log('Retrieved Telegram config:', {
        botToken: '***',
        groupId: config.groupId,
        autoPost: config.autoPost
      });
      
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
      
      console.log('Found subscription:', { id: subscription.id, title: subscription.title });
      
      // Formatar e enviar a mensagem
      const message = formatSubscriptionForTelegram(subscription);
      await sendTelegramMessage(config.botToken, config.groupId, message);
      console.log('Successfully sent subscription to Telegram');
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Ação não reconhecida
    console.log('Unrecognized action:', action);
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
