
/**
 * Edge Function para buscar assinaturas pendentes
 * Version 1.0.0
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import { logDiagnostic } from "../_shared/db-helpers.ts";

console.log("Edge function para busca de assinaturas pendentes iniciada");

serve(async (req) => {
  // Lidar com solicitações CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Inicializar o cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar se há pendentes com status_approval null e atualizar para 'pending'
    const { data: nullStatusSubs, error: nullStatusError } = await supabase
      .from('pending_subscriptions')
      .select('id')
      .is('status_approval', null);

    if (nullStatusError) {
      console.error('Erro ao buscar assinaturas com status null:', nullStatusError);
      await logDiagnostic(
        'check_pending_null_status', 
        { error_message: nullStatusError.message }, 
        false, 
        nullStatusError
      );
    } else if (nullStatusSubs && nullStatusSubs.length > 0) {
      console.log(`Encontradas ${nullStatusSubs.length} assinaturas com status null, atualizando...`);
      
      const { error: updateError } = await supabase
        .from('pending_subscriptions')
        .update({ status_approval: 'pending' })
        .is('status_approval', null);
        
      if (updateError) {
        console.error('Erro ao atualizar assinaturas com status null:', updateError);
        await logDiagnostic(
          'update_pending_null_status', 
          { error_message: updateError.message }, 
          false, 
          updateError
        );
      } else {
        console.log('Assinaturas com status null atualizadas com sucesso');
      }
    }

    // Buscar assinaturas pendentes
    const { data: pendingSubs, error: pendingError } = await supabase
      .from('pending_subscriptions')
      .select('*')
      .eq('status_approval', 'pending')
      .order('submitted_at', { ascending: false });

    if (pendingError) {
      console.error('Erro ao buscar assinaturas pendentes:', pendingError);
      await logDiagnostic(
        'get_pending_subscriptions', 
        { error_message: pendingError.message }, 
        false, 
        pendingError
      );
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: pendingError.message
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    // Logar resultados para diagnóstico
    await logDiagnostic(
      'get_pending_subscriptions_success', 
      { count: pendingSubs?.length || 0 }, 
      true
    );
    
    return new Response(
      JSON.stringify({
        success: true,
        data: pendingSubs || []
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error("Erro ao buscar assinaturas pendentes:", error);
    await logDiagnostic(
      'get_pending_subscriptions_error',
      { error_message: String(error) },
      false,
      error
    );
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: String(error)
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
