-- Adicionar tabela para armazenar modificações de assinaturas
CREATE TABLE IF NOT EXISTS public.subscription_modifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  custom_title TEXT,
  price TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL,
  access TEXT NOT NULL,
  header_color TEXT NOT NULL,
  price_color TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  telegram_username TEXT NOT NULL,
  icon TEXT,
  pix_key TEXT,
  category TEXT,
  modification_reason TEXT,
  status_approval TEXT DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela
ALTER TABLE public.subscription_modifications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para subscription_modifications
CREATE POLICY "Usuários podem ver suas próprias modificações"
ON public.subscription_modifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias modificações"
ON public.subscription_modifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias modificações pendentes"
ON public.subscription_modifications
FOR UPDATE
USING (auth.uid() = user_id AND status_approval = 'pending');

CREATE POLICY "Usuários podem deletar suas próprias modificações pendentes"
ON public.subscription_modifications
FOR DELETE
USING (auth.uid() = user_id AND status_approval = 'pending');

-- Políticas para administradores
CREATE POLICY "Admins podem ver todas as modificações"
ON public.subscription_modifications
FOR SELECT
USING (is_admin());

CREATE POLICY "Admins podem atualizar todas as modificações"
ON public.subscription_modifications
FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins podem deletar todas as modificações"
ON public.subscription_modifications
FOR DELETE
USING (is_admin());

-- Trigger para atualizar updated_at
CREATE TRIGGER update_subscription_modifications_updated_at
BEFORE UPDATE ON public.subscription_modifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();