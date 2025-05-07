
-- Enable Row Level Security for pending_subscriptions
ALTER TABLE IF EXISTS public.pending_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create security definer function for admin check
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

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
USING (public.is_admin());

-- Create policy to allow admin users to update pending subscriptions
CREATE POLICY "Admins can update all pending subscriptions" 
ON public.pending_subscriptions 
FOR UPDATE 
TO authenticated 
USING (public.is_admin());
