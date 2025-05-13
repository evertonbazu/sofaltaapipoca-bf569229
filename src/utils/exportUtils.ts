
import { SubscriptionData } from '@/types/subscriptionTypes';

/**
 * Formata dados da assinatura para um arquivo de texto usando o modelo especificado
 */
export const formatSubscriptionAsTxt = (subscription: SubscriptionData): string => {
  // Montamos o texto com o modelo solicitado
  let content = '';
  
  // Título
  content += `${subscription.icon || '🖥'} ${subscription.title}\n`;
  
  // Preço
  content += `🏦 ${subscription.price}\n`;
  
  // Método de pagamento
  content += `🤝🏼 ${subscription.paymentMethod}\n`;
  
  // Status
  content += `📌${subscription.status}\n`;
  
  // Método de acesso
  content += `🔐 ${subscription.access}\n`;
  
  // Contatos
  if (subscription.telegramUsername) {
    content += `📩${subscription.telegramUsername}\n`;
  }
  
  if (subscription.whatsappNumber) {
    content += `📱 https://wa.me/${subscription.whatsappNumber}\n`;
  }
  
  // Data de adição
  if (subscription.addedDate) {
    content += `\n📅 Adicionado em: ${subscription.addedDate}`;
  }
  
  return content;
};

/**
 * Cria e baixa um arquivo de texto com os dados da assinatura
 */
export const downloadSubscriptionAsTxt = (subscription: SubscriptionData) => {
  const content = formatSubscriptionAsTxt(subscription);
  const fileName = `${subscription.title.replace(/\s+/g, '_')}.txt`;
  
  // Criando o blob e link para download
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  // Criando link temporário para download
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  
  // Adicionando ao documento, clicando e removendo
  document.body.appendChild(link);
  link.click();
  
  // Limpeza
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
};
