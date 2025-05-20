
import { createClient } from '@supabase/supabase-js';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// API URLs do Supabase
const supabaseUrl = 'https://fdiojhklzxuqczxiinzx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkaW9qaGtsenh1cWN6eGlpbnp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3NTM3NDIsImV4cCI6MjA2MjMyOTc0Mn0.E-gaFIY8p9TeWyNfK697wDr19y49rWkUaMwFC3L5Lhc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Formata uma data para exibição em formato brasileiro
 */
export const formatDateBR = (date: Date | string | null): string => {
  if (!date) return '';
  return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
};

/**
 * Calcula dias restantes até a data de expiração
 */
export const calculateDaysRemaining = (expirationDate: Date | string | null): number => {
  if (!expirationDate) return 0;
  const today = new Date();
  return differenceInDays(new Date(expirationDate), today);
};

/**
 * Verifica se uma assinatura está prestes a expirar (menos de 3 dias)
 */
export const isExpirationImminent = (daysRemaining: number): boolean => {
  return daysRemaining >= 0 && daysRemaining <= 3;
};
