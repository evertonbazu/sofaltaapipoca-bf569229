
/**
 * Supabase Edge Function: notify-subscription-event
 * Version 3.12.0 - Notificações por e-mail para eventos de assinatura (aprovado, modificado)
 *
 * Requisitos:
 * - Secret RESEND_API_KEY configurada no projeto (já presente).
 * - Tabelas: subscriptions (com user_id, title, custom_title) e profiles (com id, email, full_name, username).
 *
 * Chamada:
 * supabase.functions.invoke('notify-subscription-event', {
 *   body: { eventType: 'approved' | 'modified', subscriptionId: 'uuid' }
 * })
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'
import { Resend } from 'npm:resend@4.0.0'

type EventType = 'approved' | 'modified'

interface RequestBody {
  eventType: EventType
  subscriptionId: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? ''

const supabase = createClient(supabaseUrl, serviceKey)
const resend = new Resend(resendApiKey)

const buildEmailContent = (eventType: EventType, title: string) => {
  if (eventType === 'approved') {
    return {
      subject: 'Seu anúncio foi aprovado!',
      html: `
        <div style="font-family: Arial, sans-serif; color: #111;">
          <h2>Parabéns! 🎉</h2>
          <p>Seu anúncio <strong>${title}</strong> foi aprovado e já está visível no site.</p>
          <p>Obrigado por contribuir com a comunidade do Só Falta a Pipoca.</p>
          <p style="color:#666;font-size:12px;">Mensagem automática - Não responda este e-mail.</p>
        </div>
      `,
    }
  }

  return {
    subject: 'Seu anúncio foi atualizado',
    html: `
      <div style="font-family: Arial, sans-serif; color: #111;">
        <h2>Atualização realizada ✅</h2>
        <p>Seu anúncio <strong>${title}</strong> foi modificado. Se você não reconhece essa alteração, entre em contato com o suporte.</p>
        <p>Equipe Só Falta a Pipoca</p>
        <p style="color:#666;font-size:12px;">Mensagem automática - Não responda este e-mail.</p>
      </div>
    `,
  }
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }

  try {
    const { eventType, subscriptionId } = (await req.json()) as RequestBody

    console.log('[notify-subscription-event] Received:', { eventType, subscriptionId })

    if (!eventType || !subscriptionId) {
      return new Response(JSON.stringify({ error: 'Missing eventType or subscriptionId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    // Buscar assinatura
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('id, title, custom_title, user_id')
      .eq('id', subscriptionId)
      .single()

    if (subError || !subscription) {
      console.error('[notify-subscription-event] Subscription not found:', subError)
      return new Response(JSON.stringify({ error: 'Subscription not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    // Se não é submissão de membro (não tem user_id), não envia e-mail
    if (!subscription.user_id) {
      console.log('[notify-subscription-event] No user_id on subscription, skipping email.')
      return new Response(JSON.stringify({ success: true, skipped: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    // Buscar perfil do usuário
    const { data: profile, error: profError } = await supabase
      .from('profiles')
      .select('email, full_name, username')
      .eq('id', subscription.user_id)
      .single()

    if (profError || !profile?.email) {
      console.error('[notify-subscription-event] Profile/email not found:', profError)
      return new Response(JSON.stringify({ error: 'Recipient email not found' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const displayTitle = subscription.custom_title || subscription.title
    const content = buildEmailContent(eventType, displayTitle)

    // Enviar e-mail
    const fromAddress = 'Notificações Só Falta a Pipoca <onboarding@resend.dev>'
    const toAddress = profile.email

    console.log('[notify-subscription-event] Sending email to:', toAddress, 'Event:', eventType)

    const { error: sendError } = await resend.emails.send({
      from: fromAddress,
      to: [toAddress],
      subject: content.subject,
      html: content.html,
    })

    if (sendError) {
      console.error('[notify-subscription-event] Resend error:', sendError)
      return new Response(JSON.stringify({ error: 'Failed to send email' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    console.log('[notify-subscription-event] Email sent successfully')
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (err) {
    console.error('[notify-subscription-event] Unexpected error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
