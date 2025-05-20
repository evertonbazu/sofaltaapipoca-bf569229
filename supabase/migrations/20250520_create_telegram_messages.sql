
-- Create the telegram_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.telegram_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL,
  message_id BIGINT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_subscription FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_telegram_messages_subscription_id ON public.telegram_messages (subscription_id);

-- Create function to check if a table exists
CREATE OR REPLACE FUNCTION public.check_table_exists(table_name text)
RETURNS boolean AS $$
DECLARE
  does_exist boolean;
BEGIN
  SELECT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = table_name
  ) INTO does_exist;
  
  RETURN does_exist;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create system task for creating telegram_messages table
CREATE OR REPLACE FUNCTION public.execute_system_task(task_type text, task_params jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  IF task_type = 'create_telegram_messages_table' THEN
    CREATE TABLE IF NOT EXISTS public.telegram_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      subscription_id UUID NOT NULL,
      message_id BIGINT NOT NULL,
      sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      CONSTRAINT fk_subscription FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_telegram_messages_subscription_id 
      ON public.telegram_messages (subscription_id);
    
    result := jsonb_build_object('success', true, 'message', 'Tabela telegram_messages criada com sucesso');
  ELSE
    result := jsonb_build_object('success', false, 'message', 'Tipo de tarefa desconhecido');
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
