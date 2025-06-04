
/**
 * Utilitário para manipulação de datas
 * Version 3.0.7
 */

/**
 * Converte uma data no formato "dd/mm/yyyy" para um objeto Date
 * @param dateString - Data no formato "dd/mm/yyyy"
 * @returns Objeto Date ou null se a data for inválida
 */
export function parseAddedDate(dateString: string): Date | null {
  if (!dateString || typeof dateString !== 'string') {
    return null;
  }

  const parts = dateString.split('/');
  if (parts.length !== 3) {
    return null;
  }

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Mês é 0-indexado no JavaScript
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    return null;
  }

  const date = new Date(year, month, day);
  
  // Verificar se a data é válida
  if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
    return null;
  }

  return date;
}

/**
 * Compara duas datas no formato "dd/mm/yyyy" para ordenação
 * @param dateA - Primeira data
 * @param dateB - Segunda data
 * @returns Número negativo se dateA < dateB, positivo se dateA > dateB, 0 se iguais
 */
export function compareDates(dateA: string | undefined, dateB: string | undefined): number {
  // Tratar datas undefined como muito antigas
  if (!dateA && !dateB) return 0;
  if (!dateA) return 1; // dateA é considerada mais antiga
  if (!dateB) return -1; // dateB é considerada mais antiga

  const parsedA = parseAddedDate(dateA);
  const parsedB = parseAddedDate(dateB);

  // Se não conseguir fazer parse, considerar como data muito antiga
  if (!parsedA && !parsedB) return 0;
  if (!parsedA) return 1;
  if (!parsedB) return -1;

  // Retornar diferença em milissegundos para ordenação
  return parsedB.getTime() - parsedA.getTime(); // Mais recente primeiro
}

/**
 * Verifica se uma data é válida no formato "dd/mm/yyyy"
 * @param dateString - Data para validar
 * @returns true se a data for válida
 */
export function isValidDate(dateString: string): boolean {
  return parseAddedDate(dateString) !== null;
}
