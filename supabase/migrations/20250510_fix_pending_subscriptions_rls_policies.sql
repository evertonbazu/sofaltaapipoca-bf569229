
-- Ensure we're using the correct is_admin() function for pending_subscriptions table
DROP POLICY IF EXISTS "Admins can view all pending subscriptions" ON public.pending_subscriptions;
DROP POLICY IF EXISTS "Admins can update all pending subscriptions" ON public.pending_subscriptions;

-- Create new admin policies using the security definer function
CREATE POLICY "Admins can view all pending subscriptions" 
ON public.pending_subscriptions 
FOR SELECT 
TO authenticated 
USING (public.is_admin());

CREATE POLICY "Admins can update all pending subscriptions" 
ON public.pending_subscriptions 
FOR UPDATE 
TO authenticated 
USING (public.is_admin());

-- Add delete and insert policies for admins
CREATE POLICY "Admins can delete any pending subscriptions" 
ON public.pending_subscriptions 
FOR DELETE 
TO authenticated 
USING (public.is_admin());

CREATE POLICY "Admins can insert any pending subscriptions" 
ON public.pending_subscriptions 
FOR INSERT 
TO authenticated 
WITH CHECK (public.is_admin());
