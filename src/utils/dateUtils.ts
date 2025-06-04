
/**
 * Converte uma data no formato DD/MM/YYYY para um objeto Date
 */
export const parseDate = (dateString: string): Date => {
  if (!dateString) return new Date(0); // Data muito antiga se não houver data
  
  const [day, month, year] = dateString.split('/');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
};

/**
 * Ordena assinaturas pela data de adição (mais recente primeiro)
 */
export const sortByDateDesc = <T extends { addedDate?: string }>(items: T[]): T[] => {
  return [...items].sort((a, b) => {
    const dateA = parseDate(a.addedDate || '');
    const dateB = parseDate(b.addedDate || '');
    
    // Ordena do mais recente para o mais antigo
    return dateB.getTime() - dateA.getTime();
  });
};
