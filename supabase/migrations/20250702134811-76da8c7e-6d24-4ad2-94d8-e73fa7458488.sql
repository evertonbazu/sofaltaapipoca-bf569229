-- Atualizar função handle_new_user para melhor suporte ao Google Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, full_name, whatsapp, telegram_username)
  VALUES (
    NEW.id, 
    COALESCE(
      NEW.raw_user_meta_data->>'username', 
      NEW.raw_user_meta_data->>'user_name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name'
    ),
    NEW.raw_user_meta_data->>'whatsapp',
    NEW.raw_user_meta_data->>'telegram_username'
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Se já existe, apenas atualizar os dados
    UPDATE public.profiles 
    SET 
      email = NEW.email,
      full_name = COALESCE(
        NEW.raw_user_meta_data->>'full_name', 
        NEW.raw_user_meta_data->>'name',
        full_name
      ),
      whatsapp = COALESCE(NEW.raw_user_meta_data->>'whatsapp', whatsapp),
      telegram_username = COALESCE(NEW.raw_user_meta_data->>'telegram_username', telegram_username),
      updated_at = now()
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar se o trigger existe, se não existir, criar
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END;
$$;