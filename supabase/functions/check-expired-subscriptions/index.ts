
/**
 * Edge Function para verificar e mover assinaturas expiradas
 * Version 1.0.1
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { checkAndMoveExpiredSubscriptions, logDiagnostic } from "../_shared/db-helpers.ts";

console.log("Edge function para verificação de assinaturas expiradas iniciada");

serve(async (req) => {
  // Lidar com solicitações CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar e mover assinaturas expiradas
    const result = await checkAndMoveExpiredSubscriptions();
    
    return new Response(
      JSON.stringify({
        success: result,
        message: result 
          ? 'Verificação de assinaturas expiradas concluída com sucesso'
          : 'Erro ao verificar assinaturas expiradas'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: result ? 200 : 500
      }
    );
  } catch (error) {
    console.error("Erro ao verificar assinaturas expiradas:", error);
    await logDiagnostic(
      'check_expired_error',
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
