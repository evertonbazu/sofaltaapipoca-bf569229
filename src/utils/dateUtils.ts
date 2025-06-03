
/**
 * Version 2.3.1
 * - Utilitários para manipulação e ordenação de datas
 */

import { SubscriptionData } from '@/types/subscriptionTypes';

/**
 * Converte uma data no formato brasileiro (DD/MM/YYYY) para um objeto Date
 * @param dateString Data no formato DD/MM/YYYY
 * @returns Objeto Date ou null se a data for inválida
 */
export function parseBrazilianDate(dateString: string): Date | null {
  if (!dateString) return null;
  
  const parts = dateString.split('/');
  if (parts.length !== 3) return null;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in Date
  const year = parseInt(parts[2], 10);
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  
  return new Date(year, month, day);
}

/**
 * Ordena uma lista de assinaturas por data de adição (mais recente primeiro)
 * @param subscriptions Array de assinaturas
 * @returns Array ordenado por data (mais recente primeiro)
 */
export function sortSubscriptionsByDateDesc(subscriptions: SubscriptionData[]): SubscriptionData[] {
  return [...subscriptions].sort((a, b) => {
    // Se não tem data, vai para o final
    if (!a.addedDate && !b.addedDate) return 0;
    if (!a.addedDate) return 1;
    if (!b.addedDate) return -1;
    
    const dateA = parseBrazilianDate(a.addedDate);
    const dateB = parseBrazilianDate(b.addedDate);
    
    // Se não conseguir fazer parse da data, vai para o final
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    
    // Ordena do mais recente para o mais antigo
    return dateB.getTime() - dateA.getTime();
  });
}

/**
 * Ordena uma lista de assinaturas por data de adição (mais antigo primeiro)
 * @param subscriptions Array de assinaturas
 * @returns Array ordenado por data (mais antigo primeiro)
 */
export function sortSubscriptionsByDateAsc(subscriptions: SubscriptionData[]): SubscriptionData[] {
  return [...subscriptions].sort((a, b) => {
    // Se não tem data, vai para o final
    if (!a.addedDate && !b.addedDate) return 0;
    if (!a.addedDate) return 1;
    if (!b.addedDate) return -1;
    
    const dateA = parseBrazilianDate(a.addedDate);
    const dateB = parseBrazilianDate(b.addedDate);
    
    // Se não conseguir fazer parse da data, vai para o final
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    
    // Ordena do mais antigo para o mais recente
    return dateA.getTime() - dateB.getTime();
  });
}
