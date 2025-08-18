
-- 1) Tabela de controle das mensagens postadas no Telegram
create table if not exists public.telegram_messages (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  message_id bigint not null,
  sent_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Evitar duplicidade de envio por anúncio
create unique index if not exists telegram_messages_subscription_uidx
  on public.telegram_messages (subscription_id);

-- Acesso para inspeção por admins (Edge Functions usarão SERVICE ROLE e ignoram RLS)
alter table public.telegram_messages enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'telegram_messages'
      and policyname = 'Admins can view telegram messages'
  ) then
    create policy "Admins can view telegram messages"
      on public.telegram_messages
      for select
      using (is_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'telegram_messages'
      and policyname = 'Admins can manage telegram messages'
  ) then
    create policy "Admins can manage telegram messages"
      on public.telegram_messages
      for all
      using (is_admin())
      with check (is_admin());
  end if;
end$$;

-- 2) Habilitar extensões necessárias para agendamentos e HTTP interno
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net  with schema extensions;

-- 3) Recriar agendamento diário às 10:00 São Paulo (13:00 UTC)
-- Remove qualquer job antigo com o mesmo nome
select cron.unschedule(jobid)
from cron.job
where jobname = 'daily-telegram-refresh';

-- Agenda a chamada ao Edge Function telegram-integration com a ação "refresh-daily"
select
  cron.schedule(
    'daily-telegram-refresh',
    '0 13 * * *',  -- 13:00 UTC = 10:00 America/Sao_Paulo
    $$
    select
      net.http_post(
        url     := 'https://fdiojhklzxuqczxiinzx.supabase.co/functions/v1/telegram-integration',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkaW9qaGtsenh1cWN6eGlpbnp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3NTM3NDIsImV4cCI6MjA2MjMyOTc0Mn0.E-gaFIY8p9TeWyNfK697wDr19y49rWkUaMwFC3L5Lhc"}'::jsonb,
        body    := '{"action":"refresh-daily"}'::jsonb
      );
    $$
  );
