
import { saveAs } from 'file-saver';
import { toast } from '@/hooks/use-toast';
import { Subscription } from '@/types/subscriptionTypes';

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
      content += '\n\n\n';
    }
    
    // Format as requested
    content += `🔢 Código: ${sub.code || 'N/A'}\n`;
    content += `🖥 ${sub.title}\n`;
    content += `🏦 ${sub.price} - ${sub.payment_method || sub.paymentMethod}\n`;
    content += `📌 ${sub.status}\n`;
    content += `🔐 ${sub.access}\n`;
    content += `📩 ${sub.telegram_username || sub.telegramUsername}\n`;
    content += `📱 ${sub.whatsapp_number || sub.whatsappNumber}\n`;
    content += `\n📅 Adicionado em: ${sub.added_date || sub.addedDate || new Date().toLocaleDateString('pt-BR')}`;
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
export const parseTxtContent = (txtContent: string): Subscription[] => {
  const subscriptions: Subscription[] = [];
  
  // Split by triple line breaks to separate subscriptions
  const blocks = txtContent.split('\n\n\n');
  
  let currentSubscription: any = {
    header_color: 'bg-blue-600',
    price_color: 'text-blue-600',
    icon: 'monitor',
    // Add aliases for UI components
    headerColor: 'bg-blue-600',
    priceColor: 'text-blue-600'
  };
  
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].trim();
    if (!block) continue;
    
    // Process each line of the subscription block
    const lines = block.split('\n');
    
    for (let j = 0; j < lines.length; j++) {
      const line = lines[j].trim();
      if (!line) continue;
      
      // Match code (🔢)
      if (line.startsWith('🔢')) {
        if (Object.keys(currentSubscription).length > 3) {
          // Save previous subscription if it has required fields
          if (currentSubscription.title && (currentSubscription.price || currentSubscription.payment_method)) {
            // Ensure both snake_case and camelCase properties are set
            if (currentSubscription.payment_method && !currentSubscription.paymentMethod) {
              currentSubscription.paymentMethod = currentSubscription.payment_method;
            } 
            if (currentSubscription.paymentMethod && !currentSubscription.payment_method) {
              currentSubscription.payment_method = currentSubscription.paymentMethod;
            }
            
            subscriptions.push({...currentSubscription});
          }
          
          // Reset for new subscription
          currentSubscription = {
            header_color: 'bg-blue-600',
            price_color: 'text-blue-600',
            icon: 'monitor',
            // Add aliases for UI components
            headerColor: 'bg-blue-600',
            priceColor: 'text-blue-600'
          };
        }
        
        const codeMatch = line.match(/🔢 Código:\s*([^\n]+)/);
        if (codeMatch && codeMatch[1]) {
          currentSubscription.code = codeMatch[1].trim();
        }
      }
      // Match title (🖥)
      else if (line.startsWith('🖥')) {
        currentSubscription.title = line.replace('🖥', '').trim();
      }
      // Match price (🏦)
      else if (line.startsWith('🏦')) {
        const priceParts = line.replace('🏦', '').trim().split('-');
        if (priceParts.length > 1) {
          currentSubscription.price = priceParts[0].trim();
          currentSubscription.payment_method = priceParts[1].trim();
          // Add camelCase alias
          currentSubscription.paymentMethod = currentSubscription.payment_method;
        } else {
          currentSubscription.price = priceParts[0].trim();
          currentSubscription.payment_method = 'PIX';
          // Add camelCase alias
          currentSubscription.paymentMethod = 'PIX';
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
        // Add camelCase alias
        currentSubscription.whatsappNumber = currentSubscription.whatsapp_number;
      }
      // Match Telegram (📩)
      else if (line.startsWith('📩')) {
        currentSubscription.telegram_username = line.replace('📩', '').trim();
        // Add camelCase alias
        currentSubscription.telegramUsername = currentSubscription.telegram_username;
      }
      // Match date (📅)
      else if (line.startsWith('📅')) {
        currentSubscription.added_date = line.replace('📅 Adicionado em:', '').trim();
        // Add camelCase alias
        currentSubscription.addedDate = currentSubscription.added_date;
      }
    }
    
    // Add the subscription after processing the block
    if (currentSubscription.title && (currentSubscription.price || currentSubscription.payment_method)) {
      // Ensure both snake_case and camelCase properties are set
      if (currentSubscription.payment_method && !currentSubscription.paymentMethod) {
        currentSubscription.paymentMethod = currentSubscription.payment_method;
      }
      if (currentSubscription.whatsapp_number && !currentSubscription.whatsappNumber) {
        currentSubscription.whatsappNumber = currentSubscription.whatsapp_number;
      }
      if (currentSubscription.telegram_username && !currentSubscription.telegramUsername) {
        currentSubscription.telegramUsername = currentSubscription.telegram_username;
      }
      if (currentSubscription.added_date && !currentSubscription.addedDate) {
        currentSubscription.addedDate = currentSubscription.added_date;
      }
      
      subscriptions.push({...currentSubscription});
      
      // Reset for next subscription
      currentSubscription = {
        header_color: 'bg-blue-600',
        price_color: 'text-blue-600',
        icon: 'monitor',
        // Add aliases for UI components
        headerColor: 'bg-blue-600',
        priceColor: 'text-blue-600'
      };
    }
  }
  
  return subscriptions;
};
