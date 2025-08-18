// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0';
import { corsHeaders } from '../_shared/cors.ts';

/**
 * Version 3.1.0
 * - Implementado sistema de renovação diária dos anúncios no Telegram
 * - Adicionada funcionalidade para deletar posts antigos e republicar anúncios visíveis
 * - Implementado rate limiting para evitar conflitos com a API do Telegram
 * 
 * Version 3.0.0
 * - Corrigido problema de envio de assinaturas aprovadas para o Telegram
 * - Melhorada depuração e relatórios de erros
 * - Adicionada verificação mais detalhada para assinaturas
 */

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

// Client regular (usado para operações básicas)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client com service role (usado para bypass RLS em operações de sistema)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Default values
const DEFAULT_BOT_TOKEN = '5921988686:AAHXpA6Wyre4BIGACaFLOqB6YrhTavIdbQQ';
const DEFAULT_GROUP_ID = '1001484207364';

// Função para formatar o conteúdo de uma assinatura para o Telegram
function formatSubscriptionForTelegram(subscription: any) {
  if (!subscription) {
    console.error('Erro: Tentativa de formatar uma assinatura nula ou indefinida');
    return 'Erro: Dados da assinatura indisponíveis';
  }
  
  console.log('Formatando assinatura para o Telegram:', {
    id: subscription.id,
    title: subscription.title,
    price: subscription.price
  });
  
  let content = '';
  
  // Title with icon
  content += `${subscription.icon || '🖥'} <b>${subscription.title}</b>\n`;
  
  // Price
  content += `🏦 <b>${subscription.price}</b>\n`;
  
  // Payment method (always include)
  content += `🤝🏼 ${subscription.payment_method}\n`;
  
  // Status
  content += `📌 ${subscription.status}\n`;
  
  // Access method
  content += `🔐 ${subscription.access}\n`;
  
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

// Função para criar os botões inline do Telegram
function createInlineButtons(subscription: any) {
  const buttons = [];
  
  // Botão para Telegram
  if (subscription.telegram_username) {
    const username = subscription.telegram_username.startsWith('@') 
      ? subscription.telegram_username.substring(1) 
      : subscription.telegram_username;
      
    buttons.push([{
      text: "Contato por Telegram",
      url: `https://t.me/${username}`
    }]);
  }
  
  // Botão para WhatsApp
  if (subscription.whatsapp_number) {
    buttons.push([{
      text: "Contato por WhatsApp",
      url: `https://wa.me/${subscription.whatsapp_number}`
    }]);
  }
  
  return buttons.length > 0 ? buttons : null;
}

// Função auxiliar para enviar mensagem para o Telegram
async function sendTelegramMessage(botToken: string, chatId: string, text: string, buttons: any = null) {
  const formattedChatId = formatChatId(chatId);
  console.log(`Sending message to Telegram. Chat ID: ${formattedChatId}`);
  console.log(`Message length: ${text.length} characters`);
  console.log(`Message content: ${text}`);
  
  const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const body: any = {
    chat_id: formattedChatId,
    text: text,
    parse_mode: 'HTML'
  };
  
  // Adicionar botões inline se existirem
  if (buttons) {
    body.reply_markup = {
      inline_keyboard: buttons
    };
  }
  
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };
  
  try {
    console.log(`Making request to Telegram API with bot token: ${botToken.substring(0, 5)}...`);
    const response = await fetch(apiUrl, options);
    const responseData = await response.json();
    
    console.log('Telegram API response status:', response.status);
    console.log('Telegram API response:', JSON.stringify(responseData));
    
    if (!responseData.ok) {
      throw new Error(`Telegram API error: ${responseData.description}`);
    }
    
    return { success: true, data: responseData };
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    throw error;
  }
}

// Função para excluir mensagem do Telegram
async function deleteTelegramMessage(botToken: string, chatId: string, messageId: number) {
  const formattedChatId = formatChatId(chatId);
  console.log(`Deleting message from Telegram. Chat ID: ${formattedChatId}, Message ID: ${messageId}`);
  
  const apiUrl = `https://api.telegram.org/bot${botToken}/deleteMessage`;
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: formattedChatId,
      message_id: messageId
    })
  };
  
  try {
    console.log(`Making request to Telegram API with bot token: ${botToken.substring(0, 5)}...`);
    const response = await fetch(apiUrl, options);
    const responseData = await response.json();
    
    console.log('Telegram API response status:', response.status);
    console.log('Telegram API response:', JSON.stringify(responseData));
    
    if (!responseData.ok) {
      throw new Error(`Telegram API error: ${responseData.description}`);
    }
    
    return { success: true, data: responseData };
  } catch (error) {
    console.error('Error deleting Telegram message:', error);
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

// Nova função para implementar delay entre chamadas
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Nova função para renovação diária dos anúncios
async function performDailyRefresh(): Promise<{ success: boolean; stats: any; error?: string }> {
  console.log('=== INICIANDO RENOVAÇÃO DIÁRIA DO TELEGRAM ===');
  
  const stats = {
    messagesDeleted: 0,
    messagesDeleteFailed: 0,
    subscriptionsResent: 0,
    subscriptionsResentFailed: 0,
    totalProcessed: 0
  };

  try {
    // Obter configurações do Telegram
    const config = await getTelegramConfig();
    console.log('Configuração do Telegram obtida:', {
      botTokenPrefix: config.botToken.substring(0, 5) + '...',
      groupId: config.groupId
    });

    // ETAPA 1: Deletar mensagens antigas do Telegram e limpar registros
    console.log('--- ETAPA 1: Deletando mensagens antigas ---');
    
    const { data: oldMessages, error: fetchError } = await supabaseAdmin
      .from('telegram_messages')
      .select('*')
      .is('deleted_at', null);

    if (fetchError) {
      console.error('Erro ao buscar mensagens antigas:', fetchError);
      throw new Error(`Erro ao buscar mensagens: ${fetchError.message}`);
    }

    console.log(`Encontradas ${oldMessages?.length || 0} mensagens para deletar`);

    if (oldMessages && oldMessages.length > 0) {
      for (const message of oldMessages) {
        try {
          console.log(`Tentando deletar mensagem ${message.message_id} da assinatura ${message.subscription_id}`);
          
          await deleteTelegramMessage(config.botToken, config.groupId, message.message_id);
          
          // Marcar como deletada na base de dados
          await supabaseAdmin
            .from('telegram_messages')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', message.id);
          
          stats.messagesDeleted++;
          console.log(`✅ Mensagem ${message.message_id} deletada com sucesso`);
          
          // Pequeno delay para evitar rate limiting
          await delay(100);
          
        } catch (deleteError) {
          console.error(`❌ Erro ao deletar mensagem ${message.message_id}:`, deleteError);
          stats.messagesDeleteFailed++;
          // Continuar mesmo com erro - não queremos parar o processo
        }
      }
    }

    // ETAPA 2: Buscar assinaturas visíveis para reenvio
    console.log('--- ETAPA 2: Buscando assinaturas para reenvio ---');
    
    const { data: visibleSubscriptions, error: subscriptionsError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('visible', true)
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (subscriptionsError) {
      console.error('Erro ao buscar assinaturas visíveis:', subscriptionsError);
      throw new Error(`Erro ao buscar assinaturas: ${subscriptionsError.message}`);
    }

    console.log(`Encontradas ${visibleSubscriptions?.length || 0} assinaturas visíveis para reenvio`);
    stats.totalProcessed = visibleSubscriptions?.length || 0;

    // ETAPA 3: Reenviar assinaturas visíveis
    console.log('--- ETAPA 3: Reenviando assinaturas ---');
    
    if (visibleSubscriptions && visibleSubscriptions.length > 0) {
      for (const subscription of visibleSubscriptions) {
        try {
          console.log(`Reenviando assinatura: ${subscription.title} (ID: ${subscription.id})`);
          
          // Formatar mensagem e criar botões
          const messageText = formatSubscriptionForTelegram(subscription);
          const inlineButtons = createInlineButtons(subscription);
          
          // Enviar mensagem
          const sendResult = await sendTelegramMessage(
            config.botToken,
            config.groupId,
            messageText,
            inlineButtons
          );
          
          if (sendResult.success && sendResult.data?.result?.message_id) {
            // Registrar nova mensagem na base de dados (remover registros antigos primeiro)
            await supabaseAdmin
              .from('telegram_messages')
              .delete()
              .eq('subscription_id', subscription.id);
            
            await supabaseAdmin
              .from('telegram_messages')
              .insert({
                subscription_id: subscription.id,
                message_id: sendResult.data.result.message_id,
                sent_at: new Date().toISOString()
              });
            
            stats.subscriptionsResent++;
            console.log(`✅ Assinatura ${subscription.title} reenviada com sucesso (Nova mensagem ID: ${sendResult.data.result.message_id})`);
          } else {
            throw new Error('Falha ao obter ID da mensagem enviada');
          }
          
          // Delay entre envios para evitar rate limiting
          await delay(150);
          
        } catch (resendError) {
          console.error(`❌ Erro ao reenviar assinatura ${subscription.title}:`, resendError);
          stats.subscriptionsResentFailed++;
          // Continuar mesmo com erro
        }
      }
    }

    console.log('=== RENOVAÇÃO DIÁRIA CONCLUÍDA ===');
    console.log('Estatísticas finais:', stats);
    
    return {
      success: true,
      stats
    };

  } catch (error) {
    console.error('Erro geral na renovação diária:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      stats
    };
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
    
    const { action, botToken, groupId, subscriptionId, messageId } = await req.json();
    console.log(`Received request with action: ${action}, subscriptionId: ${subscriptionId}, messageId: ${messageId}`);
    
    // Nova ação: Renovação diária
    if (action === 'refresh-daily') {
      console.log('Processing refresh-daily action - Starting daily Telegram refresh');
      
      const result = await performDailyRefresh();
      
      return new Response(JSON.stringify({
        success: result.success,
        message: result.success ? 'Renovação diária concluída com sucesso' : 'Renovação diária falhou',
        stats: result.stats,
        error: result.error
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

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
      
      const testMessage = `🧪 Mensagem de teste da integração SóFaltaAPipoca

✅ Sua integração com o Telegram está funcionando corretamente!

⏱️ Enviado em: ${currentDate}`;
      
      try {
        // Criar botões de teste
        const testButtons = [
          [{
            text: "Visite o site",
            url: "https://sofaltaapipoca.com.br"
          }]
        ];
        
        const result = await sendTelegramMessage(tokenToUse, groupIdToUse, testMessage, testButtons);
        return new Response(JSON.stringify({ success: true, data: result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Error in test message:', error);
        return new Response(JSON.stringify({ 
          success: false, 
          error: `Falha ao enviar mensagem de teste: ${error instanceof Error ? error.message : String(error)}` 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 // Retorna 200 mesmo com erro para facilitar o tratamento no frontend
        });
      }
    }
    
    // Excluir mensagem específica do Telegram
    if (action === 'delete-message') {
      console.log('Processing delete-message action for Message ID:', messageId);
      
      if (!messageId) {
        throw new Error('ID da mensagem não fornecido');
      }
      
      // Obter a configuração do Telegram
      const config = await getTelegramConfig();
      console.log('Retrieved Telegram config for deletion:', {
        botTokenPrefix: config.botToken.substring(0, 5) + '...',
        groupId: config.groupId
      });
      
      try {
        const result = await deleteTelegramMessage(config.botToken, config.groupId, messageId);
        console.log('Successfully deleted message from Telegram:', result);
        
        return new Response(JSON.stringify({ success: true, data: result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Error deleting message:', error);
        return new Response(JSON.stringify({ 
          success: false, 
          error: `Falha ao excluir mensagem: ${error instanceof Error ? error.message : String(error)}` 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });
      }
    }
    
    // Envio de uma assinatura específica
    if (action === 'send-subscription') {
      console.log('Processing send-subscription action for ID:', subscriptionId);
      
      if (!subscriptionId) {
        throw new Error('ID da assinatura não fornecido');
      }
      
      // Verificar se a assinatura já foi enviada (verificação dupla)
      const { data: existingMessage } = await supabase
        .from('telegram_messages')
        .select('message_id')
        .eq('subscription_id', subscriptionId)
        .maybeSingle();
      
      if (existingMessage?.message_id) {
        console.log('Assinatura já foi enviada anteriormente, ID da mensagem:', existingMessage.message_id);
        return new Response(JSON.stringify({ 
          success: true, 
          messageId: existingMessage.message_id,
          info: "Assinatura já enviada anteriormente"
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Obter a configuração do Telegram
      const config = await getTelegramConfig();
      console.log('Retrieved Telegram config:', {
        botTokenPrefix: config.botToken.substring(0, 5) + '...',
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
        console.error('Erro ao buscar assinatura:', fetchError);
        throw new Error(`Erro ao buscar assinatura: ${fetchError.message}`);
      }
      
      if (!subscription) {
        console.log('Assinatura não encontrada com o ID fornecido, verificando mais detalhes...');
        
        // Log detalhado da tabela subscriptions
        const { data: allSubs, error: allSubsError } = await supabase
          .from('subscriptions')
          .select('id')
          .limit(5);
          
        if (allSubsError) {
          console.error('Erro ao verificar exemplos de assinaturas:', allSubsError);
        } else {
          console.log('Exemplos de IDs de assinaturas na tabela:', allSubs?.map(s => s.id));
        }
        
        throw new Error(`Assinatura não encontrada com ID: ${subscriptionId}`);
      }
      
      console.log('Found subscription:', { 
        id: subscription.id, 
        title: subscription.title,
        visible: subscription.visible,
        user_id: subscription.user_id ? 'exists' : 'none',
        payment_method: subscription.payment_method,
        access: subscription.access,
        status: subscription.status
      });
      
      // Formatar o texto e criar botões
      const messageText = formatSubscriptionForTelegram(subscription);
      const inlineButtons = createInlineButtons(subscription);
      console.log('Formatted message length:', messageText.length);
      console.log('Created inline buttons:', inlineButtons ? 'Yes' : 'No');
      
      // Enviar a mensagem com botões
      try {
        const sendResult = await sendTelegramMessage(
          config.botToken, 
          config.groupId, 
          messageText, 
          inlineButtons
        );
        console.log('Successfully sent subscription to Telegram, result:', sendResult);
        
        // Extrair o ID da mensagem para armazenamento
        const messageId = sendResult.data?.result?.message_id;
        
        if (messageId) {
          // Armazenar o ID da mensagem na tabela telegram_messages
          const { error: storeError } = await supabase
            .from('telegram_messages')
            .insert({
              subscription_id: subscriptionId,
              message_id: messageId,
              sent_at: new Date().toISOString()
            });
            
          if (storeError) {
            console.error('Erro ao armazenar ID da mensagem:', storeError);
          } else {
            console.log('ID da mensagem armazenado com sucesso:', messageId);
          }
        }
        
        return new Response(JSON.stringify({ 
          success: true, 
          data: sendResult, 
          messageId: messageId 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (sendError) {
        console.error('Error sending to Telegram:', sendError);
        return new Response(JSON.stringify({ 
          success: false, 
          error: `Erro ao enviar para o Telegram: ${sendError instanceof Error ? sendError.message : String(sendError)}` 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });
      }
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
      error: `Erro na integração do Telegram: ${error instanceof Error ? error.message : String(error)}` 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
