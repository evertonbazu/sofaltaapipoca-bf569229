
import { createClient } from '@supabase/supabase-js';
import { format, differenceInDays, isValid, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// API URLs do Supabase
const supabaseUrl = 'https://fdiojhklzxuqczxiinzx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkaW9qaGtsenh1cWN6eGlpbnp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3NTM3NDIsImV4cCI6MjA2MjMyOTc0Mn0.E-gaFIY8p9TeWyNfK697wDr19y49rWkUaMwFC3L5Lhc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Formata uma data para exibição em formato brasileiro
 * Versão 3.1.3 - Corrigir problemas de formatação com datas inválidas
 */
export const formatDateBR = (date: Date | string | null): string => {
  if (!date) return '';
  
  try {
    // Converter para objeto Date se for string
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    // Verificar se a data é válida
    if (!isValid(dateObj)) {
      console.warn(`Data inválida detectada: ${date}`);
      return '';
    }
    
    return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
  } catch (error) {
    console.error(`Erro ao formatar data (${date}):`, error);
    return '';
  }
};

/**
 * Calcula dias restantes até a data de expiração
 * Versão 3.1.3 - Melhorar tratamento de datas inválidas
 */
export const calculateDaysRemaining = (expirationDate: Date | string | null): number => {
  if (!expirationDate) return 0;
  
  try {
    // Converter para objeto Date se for string
    const dateObj = typeof expirationDate === 'string' ? parseISO(expirationDate) : expirationDate;
    
    // Verificar se a data é válida
    if (!isValid(dateObj)) {
      console.warn(`Data de expiração inválida detectada: ${expirationDate}`);
      return 0;
    }
    
    const today = new Date();
    return differenceInDays(dateObj, today);
  } catch (error) {
    console.error(`Erro ao calcular dias restantes (${expirationDate}):`, error);
    return 0;
  }
};

/**
 * Verifica se uma assinatura está prestes a expirar (menos de 3 dias)
 */
export const isExpirationImminent = (daysRemaining: number): boolean => {
  return daysRemaining >= 0 && daysRemaining <= 3;
};
