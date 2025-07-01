
-- Criar tabela para logs de alterações de assinaturas
CREATE TABLE public.subscription_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID,
  subscription_title TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('addition', 'deletion', 'update')),
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  details JSONB DEFAULT '{}'::jsonb
);

-- Habilitar RLS na tabela de logs
ALTER TABLE public.subscription_logs ENABLE ROW LEVEL SECURITY;

-- Política para administradores visualizarem todos os logs
CREATE POLICY "Admins can view all subscription logs" 
  ON public.subscription_logs 
  FOR SELECT 
  USING (is_admin());

-- Política para administradores inserirem logs
CREATE POLICY "Admins can insert subscription logs" 
  ON public.subscription_logs 
  FOR INSERT 
  WITH CHECK (is_admin());

-- Função para registrar logs automaticamente
CREATE OR REPLACE FUNCTION log_subscription_change()
RETURNS TRIGGER AS $$
DECLARE
  user_profile RECORD;
  action_type_val TEXT;
BEGIN
  -- Determinar o tipo de ação
  IF TG_OP = 'INSERT' THEN
    action_type_val := 'addition';
  ELSIF TG_OP = 'DELETE' THEN
    action_type_val := 'deletion';
  ELSE
    action_type_val := 'update';
  END IF;

  -- Buscar informações do usuário
  SELECT full_name, username INTO user_profile 
  FROM public.profiles 
  WHERE id = COALESCE(NEW.user_id, OLD.user_id);

  -- Inserir log
  INSERT INTO public.subscription_logs (
    subscription_id,
    subscription_title,
    action_type,
    user_id,
    user_name
  ) VALUES (
    COALESCE(NEW.id, OLD.id),
    COALESCE(NEW.title, OLD.title),
    action_type_val,
    COALESCE(NEW.user_id, OLD.user_id),
    COALESCE(user_profile.full_name, user_profile.username, 'Sistema')
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar triggers para a tabela subscriptions
CREATE TRIGGER subscription_log_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION log_subscription_change();

-- Criar triggers para a tabela pending_subscriptions
CREATE TRIGGER pending_subscription_log_trigger
  AFTER INSERT OR DELETE ON public.pending_subscriptions
  FOR EACH ROW EXECUTE FUNCTION log_subscription_change();
