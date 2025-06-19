
-- Adicionar campo full_name à tabela subscriptions
ALTER TABLE public.subscriptions 
ADD COLUMN full_name TEXT;

-- Adicionar campo full_name à tabela pending_subscriptions
ALTER TABLE public.pending_subscriptions 
ADD COLUMN full_name TEXT;

-- Adicionar campo full_name à tabela expired_subscriptions  
ALTER TABLE public.expired_subscriptions 
ADD COLUMN full_name TEXT;
