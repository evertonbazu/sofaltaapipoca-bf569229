
-- Enable Row Level Security for pending_subscriptions
ALTER TABLE IF EXISTS public.pending_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to insert their own submissions
CREATE POLICY "Users can insert their own pending subscriptions" 
ON public.pending_subscriptions 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to view their own submissions
CREATE POLICY "Users can view their own pending subscriptions" 
ON public.pending_subscriptions 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Create policy to allow users to update their own pending subscriptions
CREATE POLICY "Users can update their own pending subscriptions" 
ON public.pending_subscriptions 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- Create policy to allow admin users to select all pending subscriptions
CREATE POLICY "Admins can view all pending subscriptions" 
ON public.pending_subscriptions 
FOR SELECT 
TO authenticated 
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Create policy to allow admin users to update pending subscriptions
CREATE POLICY "Admins can update all pending subscriptions" 
ON public.pending_subscriptions 
FOR UPDATE 
TO authenticated 
USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Create an example pending subscription record (for testing purposes)
-- Replace UUID with an actual user_id from your system
-- INSERT INTO public.pending_subscriptions (
--   title, 
--   price, 
--   payment_method, 
--   status, 
--   access, 
--   whatsapp_number,
--   telegram_username,
--   header_color,
--   price_color,
--   user_id,
--   added_date,
--   status_approval
-- ) VALUES (
--   'EXEMPLO NETFLIX',
--   'R$ 15,00',
--   'PIX (Mensal)',
--   'Assinado (2 vagas)',
--   'LOGIN E SENHA',
--   '5511999999999',
--   '@usuario_teste',
--   'bg-red-600',
--   'text-red-600',
--   'USER_UUID_HERE', -- Replace with actual UUID
--   '07/05/2025',
--   'pending'
-- );
