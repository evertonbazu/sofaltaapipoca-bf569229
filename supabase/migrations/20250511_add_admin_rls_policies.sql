
-- Adiciona políticas RLS para a tabela de subscriptions
ALTER TABLE IF EXISTS public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Política para que administradores possam inserir novas assinaturas
CREATE POLICY IF NOT EXISTS "Admins can insert subscriptions" 
ON public.subscriptions 
FOR INSERT 
TO authenticated 
WITH CHECK (public.is_admin());

-- Política para que administradores possam atualizar assinaturas
CREATE POLICY IF NOT EXISTS "Admins can update subscriptions" 
ON public.subscriptions 
FOR UPDATE 
TO authenticated 
USING (public.is_admin());

-- Política para que administradores possam excluir assinaturas
CREATE POLICY IF NOT EXISTS "Admins can delete subscriptions" 
ON public.subscriptions 
FOR DELETE 
TO authenticated 
USING (public.is_admin());

-- Política para que qualquer pessoa autenticada ou não possa visualizar as assinaturas
CREATE POLICY IF NOT EXISTS "Everyone can view subscriptions" 
ON public.subscriptions 
FOR SELECT 
TO authenticated, anon
USING (true);

-- Certifique-se que a tabela de pendências está com RLS habilitado
ALTER TABLE IF EXISTS public.pending_subscriptions ENABLE ROW LEVEL SECURITY;

-- Garante que administradores possam inserir pendências
CREATE POLICY IF NOT EXISTS "Admins can insert pending subscriptions" 
ON public.pending_subscriptions 
FOR INSERT 
TO authenticated 
WITH CHECK (public.is_admin());

-- Garante que administradores possam atualizar pendências
CREATE POLICY IF NOT EXISTS "Admins can update pending subscriptions" 
ON public.pending_subscriptions 
FOR UPDATE 
TO authenticated 
USING (public.is_admin());

-- Garante que administradores possam excluir pendências
CREATE POLICY IF NOT EXISTS "Admins can delete pending subscriptions" 
ON public.pending_subscriptions 
FOR DELETE 
TO authenticated 
USING (public.is_admin());

-- Garante que administradores possam selecionar pendências
CREATE POLICY IF NOT EXISTS "Admins can select pending subscriptions" 
ON public.pending_subscriptions 
FOR SELECT 
TO authenticated 
USING (public.is_admin());

-- Garante que usuários possam ver suas próprias pendências
CREATE POLICY IF NOT EXISTS "Users can view their own pending subscriptions" 
ON public.pending_subscriptions 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Garante que usuários possam inserir suas próprias pendências
CREATE POLICY IF NOT EXISTS "Users can insert their own pending subscriptions" 
ON public.pending_subscriptions 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Garante que usuários possam atualizar suas próprias pendências
CREATE POLICY IF NOT EXISTS "Users can update their own pending subscriptions" 
ON public.pending_subscriptions 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);
