
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
  código?: number;
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
    content += `🖥 ${sub.title}\n`;
    content += `🏦 ${sub.price} - ${sub.payment_method}\n`;
    content += `📌 ${sub.status}\n`;
    content += `🔐 ${sub.access}\n`;
    content += `📱 ${sub.whatsapp_number}\n`;
    content += `📩 ${sub.telegram_username}\n`;
    if (sub.pix_qr_code) {
      content += `QR Code PIX: ${sub.pix_qr_code}\n`;
    }
    if (sub.código) {
      content += `Código: ${sub.código}\n`;
    }
    
    if (sub.added_date) {
      content += `\n📅 Adicionado em:\n${sub.added_date}\n`;
    }
    
    content += ';\n\n';
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

/**
 * Parse TXT content in the export format to subscription objects
 * @param txtContent The content of the TXT file
 * @returns Array of parsed subscription objects
 */
export const parseTxtContent = (txtContent: string): any[] => {
  const subscriptions: any[] = [];
  
  // Split by subscription blocks
  const blocks = txtContent.split('=== ASSINATURA');
  
  blocks.forEach(block => {
    if (!block.trim()) return;
    
    // Create a new subscription object
    const subscription: any = {
      header_color: 'bg-blue-600',
      price_color: 'text-blue-600',
      icon: 'monitor'
    };
    
    // Match title (🖥)
    const titleMatch = block.match(/🖥\s+(.+)/);
    if (titleMatch) subscription.title = titleMatch[1].trim();
    
    // Match price (🏦)
    const priceMatch = block.match(/🏦\s+(.+)/);
    if (priceMatch) {
      const priceParts = priceMatch[1].split('-');
      if (priceParts.length > 1) {
        subscription.price = priceParts[0].trim();
        subscription.payment_method = priceParts[1].trim();
      } else {
        subscription.price = priceMatch[1].trim();
        subscription.payment_method = 'Não especificado';
      }
    }
    
    // Match status (📌)
    const statusMatch = block.match(/📌\s+(.+)/);
    if (statusMatch) subscription.status = statusMatch[1].trim();
    
    // Match access (🔐)
    const accessMatch = block.match(/🔐\s+(.+)/);
    if (accessMatch) subscription.access = accessMatch[1].trim();
    
    // Match WhatsApp (📱)
    const whatsappMatch = block.match(/📱\s+(.+)/);
    if (whatsappMatch) subscription.whatsapp_number = whatsappMatch[1].trim();
    
    // Match Telegram (📩)
    const telegramMatch = block.match(/📩\s+(.+)/);
    if (telegramMatch) subscription.telegram_username = telegramMatch[1].trim();
    
    // Match QR Code
    const qrCodeMatch = block.match(/QR Code PIX:\s+(.+)/);
    if (qrCodeMatch) subscription.pix_qr_code = qrCodeMatch[1].trim();
    
    // Match Code
    const codeMatch = block.match(/Código:\s+(\d+)/);
    if (codeMatch) subscription.código = parseInt(codeMatch[1].trim());
    
    // Match date (📅)
    const dateMatch = block.match(/📅 Adicionado em:\s*\n*(.+?)\n/);
    if (dateMatch) subscription.added_date = dateMatch[1].trim();
    
    // Only add subscription if at least title and price are defined
    if (subscription.title && subscription.price) {
      subscriptions.push(subscription);
    }
  });
  
  return subscriptions;
};

