
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS configuration to allow calls from the web application
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Format subscription for sharing
function formatSubscriptionForSharing(subscription: any): string {
  let content = '';
  
  // Title with icon
  content += `${subscription.icon || '🖥'} ${subscription.title}\n`;
  
  // Price
  content += `🏦 ${subscription.price}\n`;
  
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
  
  // Added date
  if (subscription.added_date) {
    content += `\n📅 Adicionado em: ${subscription.added_date}`;
  }
  
  // Subscription code
  if (subscription.code) {
    content += `\n🔑 Código: ${subscription.code}`;
  }
  
  // Note that it was posted automatically
  content += `\n\n✨ Enviado automaticamente por SóFaltaAPipoca`;
  
  return content;
}

// Send message to Telegram
async function sendTelegramMessage(botToken: string, chatId: string, text: string) {
  console.log(`Sending message to Telegram. Chat ID: ${chatId}`);
  
  // Ensure chatId is properly formatted
  let formattedChatId = chatId;
  if (!chatId.startsWith('-') && !chatId.startsWith('@')) {
    // If it's a numeric group ID without the hyphen, add it
    // Telegram group IDs typically start with -100 for supergroups
    formattedChatId = `-100${chatId}`;
  }
  
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: formattedChatId,
        text: text,
        parse_mode: 'HTML',
      }),
    });
    
    const responseData = await response.json();
    console.log('Telegram API response:', JSON.stringify(responseData));
    
    if (!response.ok) {
      console.error('Telegram API error:', responseData);
      return {
        success: false,
        error: `Telegram API error: ${responseData.description || 'Unknown error'}`
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

// Get site configuration
async function getSiteConfig(supabase: any, key: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('site_configurations')
    .select('value')
    .eq('key', key)
    .maybeSingle();
  
  if (error) {
    console.error(`Error getting site config ${key}:`, error);
    return null;
  }
  
  return data?.value || null;
}

// Edge function handler
serve(async (req) => {
  // Handle CORS for OPTIONS requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  try {
    // Create Supabase client with the URL and anon key from environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get request data
    const requestData = await req.json();

    // Check the requested action
    const action = requestData.action;

    // Route for sending test message
    if (action === 'send-telegram-test') {
      const { botToken, groupId } = requestData;
      
      if (!botToken || !groupId) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Bot token and group ID are required' 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      const testMessage = `🧪 Test message from SóFaltaAPipoca integration\n\n✅ Your Telegram integration is working correctly!\n\n⏱️ Sent at: ${new Date().toLocaleString('pt-BR')}`;
      
      const result = await sendTelegramMessage(botToken, groupId, testMessage);
      
      return new Response(
        JSON.stringify(result),
        {
          status: result.success ? 200 : 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Route for sending a specific subscription
    if (action === 'send-subscription') {
      // Check if automatic posting is enabled
      const autoPostEnabled = await getSiteConfig(supabase, 'auto_post_to_telegram');
      
      if (autoPostEnabled !== 'true') {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Automatic posting to Telegram is disabled' 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      // Get bot token and group ID from configuration
      const botToken = await getSiteConfig(supabase, 'telegram_bot_token');
      const groupId = await getSiteConfig(supabase, 'telegram_group_id');
      
      if (!botToken || !groupId) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Bot token or group ID not configured' 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      // Get subscription ID and fetch data
      const { subscriptionId } = requestData;
      
      if (!subscriptionId) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Subscription ID is required' 
          }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      // Get subscription data
      const { data: subscription, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .maybeSingle();
      
      if (subscriptionError || !subscription) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Subscription not found' 
          }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      // Format and send message
      const formattedMessage = formatSubscriptionForSharing(subscription);
      const result = await sendTelegramMessage(botToken, groupId, formattedMessage);
      
      // Log the result
      if (result.success) {
        await supabase
          .from('error_logs')
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

    // Default route
    return new Response(
      JSON.stringify({
        message: 'Telegram Integration API',
        endpoints: [
          'send-telegram-test - Send a test message',
          'send-subscription - Send a subscription to Telegram'
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
