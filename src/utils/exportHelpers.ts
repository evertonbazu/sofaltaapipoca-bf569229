
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
    if (index > 0) {
      // Add double line break between subscriptions
      content += '\n\n';
    }
    
    content += `🖥 ${sub.title}\n`;
    content += `🏦 ${sub.price} - ${sub.payment_method}\n`;
    content += `📌 ${sub.status}\n`;
    content += `🔐 ${sub.access}\n`;
    content += `📩 ${sub.telegram_username}\n`;
    content += `📱 ${sub.whatsapp_number}\n`;
    
    if (sub.código) {
      content += `\nCódigo: ${sub.código}\n`;
    }
    
    content += `\n📅 Adicionado em: ${sub.added_date || new Date().toLocaleDateString('pt-BR')}`;
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
  
  // Split by double line breaks to separate subscriptions
  const blocks = txtContent.split('\n\n');
  
  let currentSubscription: any = {
    header_color: 'bg-blue-600',
    price_color: 'text-blue-600',
    icon: 'monitor'
  };
  
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].trim();
    if (!block) continue;
    
    // Process each line of the subscription block
    const lines = block.split('\n');
    
    lines.forEach(line => {
      line = line.trim();
      if (!line) return;
      
      // Match title (🖥)
      if (line.startsWith('🖥')) {
        if (Object.keys(currentSubscription).length > 3) {
          // Save previous subscription if it has required fields
          if (currentSubscription.title && currentSubscription.price) {
            subscriptions.push({...currentSubscription});
          }
          
          // Reset for new subscription
          currentSubscription = {
            header_color: 'bg-blue-600',
            price_color: 'text-blue-600',
            icon: 'monitor'
          };
        }
        currentSubscription.title = line.replace('🖥', '').trim();
      }
      // Match price (🏦)
      else if (line.startsWith('🏦')) {
        const priceParts = line.replace('🏦', '').trim().split('-');
        if (priceParts.length > 1) {
          currentSubscription.price = priceParts[0].trim();
          currentSubscription.payment_method = priceParts[1].trim();
        } else {
          currentSubscription.price = priceParts[0].trim();
          currentSubscription.payment_method = 'PIX';
        }
      }
      // Match status (📌)
      else if (line.startsWith('📌')) {
        currentSubscription.status = line.replace('📌', '').trim();
      }
      // Match access (🔐)
      else if (line.startsWith('🔐')) {
        currentSubscription.access = line.replace('🔐', '').trim();
      }
      // Match WhatsApp (📱)
      else if (line.startsWith('📱')) {
        currentSubscription.whatsapp_number = line.replace('📱', '').trim();
      }
      // Match Telegram (📩)
      else if (line.startsWith('📩')) {
        currentSubscription.telegram_username = line.replace('📩', '').trim();
      }
      // Match date (📅)
      else if (line.startsWith('📅')) {
        currentSubscription.added_date = line.replace('📅 Adicionado em:', '').trim();
      }
      // Match code (Código)
      else if (line.toLowerCase().startsWith('código:')) {
        const codeMatch = line.match(/Código:\s*(\d+)/i);
        if (codeMatch && codeMatch[1]) {
          currentSubscription.código = parseInt(codeMatch[1].trim());
        }
      }
    });
  }
  
  // Add the last subscription if it has required fields
  if (currentSubscription.title && currentSubscription.price) {
    subscriptions.push(currentSubscription);
  }
  
  return subscriptions;
};
