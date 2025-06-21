
/**
 * Utilitários para formatação de dados do formulário
 * @version 3.7.0
 */

/**
 * Formata valor monetário para o padrão brasileiro R$ 00,00
 */
export const formatCurrency = (value: string): string => {
  // Remove qualquer caractere que não seja número, vírgula ou ponto
  let numericValue = value.replace(/[^\d,\.]/g, '');
  
  // Se começar com vírgula ou ponto, adiciona um zero antes
  if (numericValue.startsWith(',') || numericValue.startsWith('.')) {
    numericValue = '0' + numericValue;
  }
  
  // Substitui ponto por vírgula para padrão brasileiro
  numericValue = numericValue.replace('.', ',');
  
  // Se não tem vírgula, adiciona ,00
  if (!numericValue.includes(',')) {
    numericValue = numericValue + ',00';
  } else {
    // Se tem vírgula, garantir que tem 2 dígitos após a vírgula
    const parts = numericValue.split(',');
    if (parts[1].length === 1) {
      numericValue = parts[0] + ',' + parts[1] + '0';
    } else if (parts[1].length > 2) {
      numericValue = parts[0] + ',' + parts[1].substring(0, 2);
    }
  }
  
  return `R$ ${numericValue}`;
};

/**
 * Manipula a mudança de valor do campo de preço
 */
export const handlePriceChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  setValue: (name: string, value: string) => void
) => {
  const formattedValue = formatCurrency(e.target.value);
  setValue("price", formattedValue);
};

/**
 * Formata número do WhatsApp para o padrão brasileiro +5511999999999
 */
export const formatWhatsApp = (value: string): string => {
  // Remove qualquer caractere que não seja número
  let numericValue = value.replace(/[^\d]/g, '');
  
  // Se não começar com 55, adiciona
  if (!numericValue.startsWith('55')) {
    numericValue = '55' + numericValue;
  }
  
  return `+${numericValue}`;
};

/**
 * Manipula a mudança de valor do campo WhatsApp
 */
export const handleWhatsAppChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  setValue: (name: string, value: string) => void
) => {
  const formattedValue = formatWhatsApp(e.target.value);
  setValue("whatsappNumber", formattedValue);
};

/**
 * Formata usuário do Telegram mantendo o @
 */
export const formatTelegram = (value: string): string => {
  if (!value) return "@";
  
  // Remove @ existentes e adiciona apenas um no início
  const cleanValue = value.replace(/@/g, '');
  return cleanValue ? `@${cleanValue}` : "@";
};

/**
 * Manipula a mudança de valor do campo Telegram
 */
export const handleTelegramChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  setValue: (name: string, value: string) => void
) => {
  const formattedValue = formatTelegram(e.target.value);
  setValue("telegramUsername", formattedValue);
};
