
import { saveAs } from 'file-saver';
import { toast } from '@/hooks/use-toast';

interface Subscription {
  id: string;
  title: string;
  price: string;
  payment_method: string;
  status: string;
  access: string;
  whatsapp_number: string;
  telegram_username: string;
  pix_qr_code?: string;
  added_date?: string;
}

/**
 * Generates a text content from selected subscriptions
 * @param selectedSubs Array of selected subscriptions
 * @returns Formatted text content
 */
export const generateTxtContent = (selectedSubs: Subscription[]) => {
  let content = '';
  
  selectedSubs.forEach((sub, index) => {
    content += `=== ASSINATURA ${index + 1} ===\n`;
    content += `Título: ${sub.title}\n`;
    content += `🏦 Valor: ${sub.price}\n`;
    content += `💰 Forma de pagamento: ${sub.payment_method}\n`;
    content += `📌 Status: ${sub.status}\n`;
    content += `🔐 Acesso: ${sub.access}\n`;
    content += `📱 WhatsApp: ${sub.whatsapp_number}\n`;
    content += `📩 Telegram: ${sub.telegram_username}\n`;
    if (sub.pix_qr_code) {
      content += `QR Code PIX: ${sub.pix_qr_code}\n`;
    }
    
    if (sub.added_date) {
      content += `\n📅 Adicionado em:\n${sub.added_date}\n`;
    }
    
    content += '\n';
  });
  
  return content;
};

/**
 * Exports subscriptions as a TXT file
 * @param selectedSubs Array of selected subscriptions
 */
export const exportSubscriptionsAsTxt = (selectedSubs: Subscription[]) => {
  try {
    if (selectedSubs.length === 0) {
      toast({
        title: "Nenhum anúncio selecionado",
        description: "Selecione pelo menos um anúncio para exportar.",
        variant: "destructive"
      });
      return false;
    }
    
    // Generate TXT content
    const txtContent = generateTxtContent(selectedSubs);
    
    // Create blob and save file
    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `assinaturas_${new Date().toISOString().split('T')[0]}.txt`);
    
    toast({
      title: "Exportação concluída",
      description: `${selectedSubs.length} anúncios exportados com sucesso.`,
      variant: "default"
    });
    
    return true;
  } catch (err: any) {
    console.error('Error exporting subscriptions:', err);
    toast({
      variant: "destructive",
      title: "Erro na exportação",
      description: "Não foi possível exportar os anúncios. Tente novamente."
    });
    return false;
  }
};
