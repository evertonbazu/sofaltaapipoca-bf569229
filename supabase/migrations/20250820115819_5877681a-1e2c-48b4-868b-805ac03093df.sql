
-- 1) Ativar auditoria de alterações da tabela subscriptions em subscription_logs
-- Cria trigger para INSERT/UPDATE/DELETE
CREATE TRIGGER trg_subscriptions_log_change
AFTER INSERT OR UPDATE OR DELETE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.log_subscription_change();

-- 2) Manter updated_at automaticamente em subscriptions
CREATE TRIGGER trg_subscriptions_set_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Permitir que administradores visualizem todas as expired_subscriptions
CREATE POLICY "Admins can view all expired subscriptions"
ON public.expired_subscriptions
FOR SELECT
TO authenticated
USING (public.is_admin_user());
