
/**
 * Funções auxiliares para operações no banco de dados
 * Version 1.0.2
 * 
 * Este arquivo contém funções auxiliares para operações no banco de dados
 * que são utilizadas pelos Edge Functions.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Verifica se uma tabela existe no banco de dados
 */
export async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('check_table_exists', { 
      table_name: tableName 
    });
    
    if (error) {
      console.error(`Erro ao verificar se a tabela ${tableName} existe:`, error);
      
      // Se a função RPC não existir, tentar criar
      if (error.message.includes('does not exist')) {
        await createCheckTableExistsFunction();
        
        // Tentar novamente após criar a função
        const { data: retryData, error: retryError } = await supabase.rpc('check_table_exists', { 
          table_name: tableName 
        });
        
        if (retryError) {
          console.error(`Erro ao verificar se a tabela ${tableName} existe (segunda tentativa):`, retryError);
          return false;
        }
        
        return !!retryData;
      }
      
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error(`Erro ao verificar se a tabela ${tableName} existe:`, error);
    return false;
  }
}

/**
 * Cria a função check_table_exists no banco de dados
 */
async function createCheckTableExistsFunction() {
  try {
    const { error } = await supabase.rpc('create_check_table_exists_function');
    
    if (error) {
      // Se a função para criar a função não existir, criar manualmente
      if (error.message.includes('does not exist')) {
        const { error: sqlError } = await supabase.rpc('execute_system_sql', {
          sql: `
          CREATE OR REPLACE FUNCTION public.check_table_exists(table_name text)
          RETURNS boolean
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          DECLARE
            exists_bool BOOLEAN;
          BEGIN
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public'
              AND table_name = $1
            ) INTO exists_bool;
            
            RETURN exists_bool;
          END;
          $$;
          
          -- Criar a função para executar SQL de sistema
          CREATE OR REPLACE FUNCTION public.execute_system_sql(sql text)
          RETURNS json
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          BEGIN
            EXECUTE sql;
            RETURN json_build_object('success', true);
          EXCEPTION WHEN OTHERS THEN
            RETURN json_build_object('success', false, 'error', SQLERRM);
          END;
          $$;
          
          -- Função para executar tarefas de sistema
          CREATE OR REPLACE FUNCTION public.execute_system_task(
            task_type text,
            task_params jsonb DEFAULT '{}'::jsonb
          )
          RETURNS json
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          DECLARE
            result json;
          BEGIN
            IF task_type = 'create_telegram_messages_table' THEN
              -- Criar tabela telegram_messages se não existir
              IF NOT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public'
                AND table_name = 'telegram_messages'
              ) THEN
                CREATE TABLE public.telegram_messages (
                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                  subscription_id UUID NOT NULL,
                  message_id BIGINT NOT NULL,
                  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
                  CONSTRAINT fk_subscription
                    FOREIGN KEY(subscription_id)
                    REFERENCES public.subscriptions(id)
                    ON DELETE CASCADE
                );
                
                -- Adicionar índice para consultas rápidas por subscription_id
                CREATE INDEX idx_telegram_messages_subscription_id
                ON public.telegram_messages(subscription_id);
                
                result = json_build_object('success', true, 'message', 'Tabela telegram_messages criada com sucesso');
              ELSE
                result = json_build_object('success', true, 'message', 'Tabela telegram_messages já existe');
              END IF;
            ELSE
              result = json_build_object('success', false, 'error', 'Tipo de tarefa desconhecido');
            END IF;
            
            RETURN result;
          EXCEPTION WHEN OTHERS THEN
            RETURN json_build_object('success', false, 'error', SQLERRM);
          END;
          $$;
          `
        });
        
        if (sqlError) {
          console.error('Erro ao criar funções auxiliares:', sqlError);
        } else {
          console.log('Funções auxiliares criadas com sucesso');
        }
      } else {
        console.error('Erro ao criar função check_table_exists:', error);
      }
    } else {
      console.log('Função check_table_exists criada com sucesso');
    }
  } catch (error) {
    console.error('Erro ao criar função check_table_exists:', error);
  }
}

/**
 * Cria a tabela telegram_messages se não existir
 */
export async function createTelegramMessagesTable(): Promise<boolean> {
  try {
    const tableExists = await checkTableExists('telegram_messages');
    
    if (tableExists) {
      console.log('Tabela telegram_messages já existe');
      return true;
    }
    
    const { error } = await supabase.rpc('execute_system_task', {
      task_type: 'create_telegram_messages_table',
      task_params: {}
    });
    
    if (error) {
      console.error('Erro ao criar tabela telegram_messages:', error);
      return false;
    }
    
    console.log('Tabela telegram_messages criada com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao criar tabela telegram_messages:', error);
    return false;
  }
}

/**
 * Registra um log de diagnóstico
 */
export async function logDiagnostic(
  operation: string, 
  details: Record<string, any>,
  success: boolean,
  errorDetails?: any
): Promise<void> {
  try {
    const { error } = await supabase
      .from('diagnostic_logs')
      .insert({
        operation,
        details,
        success,
        error_details: errorDetails
      });
      
    if (error) {
      console.error('Erro ao salvar log de diagnóstico:', error);
    }
  } catch (error) {
    console.error('Erro ao registrar diagnóstico:', error);
  }
}
