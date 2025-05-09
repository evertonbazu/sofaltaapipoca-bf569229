
import { supabase } from '@/integrations/supabase/client';
import { prepareSubscriptionForDB } from '@/types/subscriptionTypes';

// Function to generate a subscription code
const generateCode = () => `SF${Math.floor(1000 + Math.random() * 9000)}`;

// Sample subscriptions data from the user's request
const subscriptionsData = [
  {
    title: "PARAMOUNT PADRÃO (MELI+)",
    price: "R$ 6,00 - PIX (Mensal)",
    status: "disponível",
    access: "LOGIN E SENHA",
    telegram_username: "@Eduardok10cds",
    whatsapp_number: "5575999997951",
    added_date: "09/04/2025",
    payment_method: "PIX",
  },
  {
    title: "YOUTUBE PREMIUM",
    price: "120,00 /ano - PIX (Mensal)",
    status: "disponível",
    access: "CONVITE POR E-MAIL",
    telegram_username: "@Rastelinho",
    whatsapp_number: "5527988292875",
    added_date: "15/04/2025",
    payment_method: "PIX",
  },
  {
    title: "NETFLIX (DISPOSITIVOS MÓVEIS/TV)",
    price: "R$ 32,00 - PIX (Mensal)",
    status: "disponível",
    access: "CONVITE POR E-MAIL",
    telegram_username: "@EvandersonAraujo",
    whatsapp_number: "5531975374153",
    added_date: "15/04/2025",
    payment_method: "PIX",
  },
  {
    title: "GOOGLE ONE IA PREMIUM 2TB COM GEMINI ADVANCED 2.5",
    price: "R$ 20,00 - PIX (Mensal)",
    status: "disponível",
    access: "CONVITE POR E-MAIL",
    telegram_username: "@brenokennedyof",
    whatsapp_number: "5598984045368",
    added_date: "16/04/2025",
    payment_method: "PIX",
  },
  {
    title: "ALURA PLUS",
    price: "R$ 20,00 - PIX (Mensal)",
    status: "disponível",
    access: "LOGIN E SENHA",
    telegram_username: "@evertonbazu",
    whatsapp_number: "5513992077804",
    added_date: "16/04/2025",
    payment_method: "PIX",
  },
  {
    title: "GRAN CURSOS ILIMITADO AMIGOS",
    price: "R$ 34,00 - PIX (Mensal)",
    status: "disponível",
    access: "CONVITE POR E-MAIL",
    telegram_username: "@DonaMariaRosa",
    whatsapp_number: "5562982292725",
    added_date: "18/04/2025",
    payment_method: "PIX",
  },
  {
    title: "SPOTIFY",
    price: "R$ 7,00 - PIX (Mensal)",
    status: "disponível",
    access: "CONVITE POR E-MAIL",
    telegram_username: "@pedro127",
    whatsapp_number: "5588992259940",
    added_date: "19/04/2025",
    payment_method: "PIX",
  },
  {
    title: "NETFLIX 4K + APPLE TV + GLOBO PLAY PREMIUM SEM ANUNCIO + 27 CANAIS",
    price: "R$ 29,99 - PIX (Mensal)",
    status: "disponível",
    access: "LOGIN E SENHA",
    telegram_username: "@OliveiraBoB",
    whatsapp_number: "5585992166014",
    added_date: "19/04/2025",
    payment_method: "PIX",
  },
  {
    title: "AMAZON PRIME VIDEO",
    price: "R$ 5,50 - PIX (Mensal)",
    status: "disponível",
    access: "ATIVAÇÃO POR CÓDIGO.",
    telegram_username: "@BrunnoSSantos",
    whatsapp_number: "5511912659702",
    added_date: "21/04/2025",
    payment_method: "PIX",
  },
  {
    title: "CRUNCHYROLL",
    price: "R$ 5,75 - PIX (Mensal)",
    status: "disponível",
    access: "ATIVAÇÃO POR CÓDIGO",
    telegram_username: "@BrunnoSSantos",
    whatsapp_number: "5511912659702",
    added_date: "21/04/2025",
    payment_method: "PIX",
  },
  {
    title: "SPOTIFY",
    price: "R$ 7,50 - PIX (Mensal)",
    status: "disponível",
    access: "CONVITE POR E-MAIL",
    telegram_username: "@BrunnoSSantos",
    whatsapp_number: "5511912659702",
    added_date: "21/04/2025",
    payment_method: "PIX",
  },
  {
    title: "DISNEY+ PADRÃO (COM ANÚNCIOS)",
    price: "R$ 8,00 - PIX (Mensal)",
    status: "disponível",
    access: "LOGIN E SENHA",
    telegram_username: "@kiwi_docinho",
    whatsapp_number: "5583986510421",
    added_date: "21/04/2025",
    payment_method: "PIX",
  },
  {
    title: "CANVA",
    price: "R$ 10,00 - PIX (Mensal)",
    status: "disponível",
    access: "CONVITE",
    telegram_username: "@evertonbazu",
    whatsapp_number: "5513992077804",
    added_date: "25/04/2025",
    payment_method: "PIX",
  },
  {
    title: "NETFLIX (DISPOSITIVOS MÓVEIS/TV)",
    price: "R$ 30,00 - PIX (Mensal)",
    status: "disponível",
    access: "LOGIN E SENHA",
    telegram_username: "@OLIVEIRABOB",
    whatsapp_number: "5585992166014",
    added_date: "27/04/2025",
    payment_method: "PIX",
  },
  {
    title: "APPLE TV+",
    price: "R$ 6,90 - PIX (Mensal)",
    status: "disponível",
    access: "LOGIN E SENHA",
    telegram_username: "@ojuniormauricio",
    whatsapp_number: "5574981207317",
    added_date: "27/04/2025",
    payment_method: "PIX",
  },
  {
    title: "Netflix (Cel/PC)",
    price: "R$ 15 - PIX (Mensal)",
    status: "disponível",
    access: "Email e Senha",
    telegram_username: "@alessadinozzo",
    whatsapp_number: "5587991988684",
    added_date: "27/04/2025",
    payment_method: "PIX",
  },
  {
    title: "Apple TV",
    price: "R$ 7 - PIX (Mensal)",
    status: "disponível",
    access: "Email e Senha",
    telegram_username: "@alessadinozzo",
    whatsapp_number: "5587991988684",
    added_date: "27/04/2025",
    payment_method: "PIX",
  },
  {
    title: "MCAFEE TOTAL PROTECTION",
    price: "R$ 5,00 - PIX (Mensal)",
    status: "disponível",
    access: "ATIVAÇÃO",
    telegram_username: "@otaviodw",
    whatsapp_number: "5527997692531",
    added_date: "29/04/2025",
    payment_method: "PIX",
  },
  {
    title: "PLAYPLUS",
    price: "R$ 4,50 - PIX (Mensal)",
    status: "disponível",
    access: "LOGIN E SENHA",
    telegram_username: "@brenokennedyof",
    whatsapp_number: "5598984045368",
    added_date: "01/05/2025",
    payment_method: "PIX",
  },
  {
    title: "MUBI",
    price: "R$ 15,00 - PIX (Mensal)",
    status: "disponível",
    access: "ATIVAÇÃO",
    telegram_username: "@brenokennedyof",
    whatsapp_number: "5598984045368",
    added_date: "01/05/2025",
    payment_method: "PIX",
  },
  {
    title: "MAX STANDARD",
    price: "R$ 7,00 - PIX (Mensal)",
    status: "disponível",
    access: "ATIVAÇÃO",
    telegram_username: "@arnaldojhony",
    whatsapp_number: "5575992630618",
    added_date: "01/05/2025",
    payment_method: "PIX",
  },
  {
    title: "PARAMOUNT PREMIUM",
    price: "R$ 10,00 - PIX (Mensal)",
    status: "disponível",
    access: "LOGIN E SENHA",
    telegram_username: "@OLIVEIRABOB",
    whatsapp_number: "5585992166014",
    added_date: "01/05/2025",
    payment_method: "PIX",
  },
  {
    title: "GLOBO PLAY PREMIUM + 27 CANAIS + APPLE TV+",
    price: "R$ 16,90 - PIX (Mensal)",
    status: "disponível",
    access: "CONVITE POR E-MAIL",
    telegram_username: "@OLIVEIRABOB",
    whatsapp_number: "5585992166014",
    added_date: "03/05/2025",
    payment_method: "PIX",
  },
  {
    title: "CRUNCHYROLL",
    price: "R$ 9,00 - PIX (Mensal)",
    status: "indisponível",
    access: "LOGIN E SENHA",
    telegram_username: "@Thamy78",
    whatsapp_number: "5586995736762",
    added_date: "03/05/2025",
    payment_method: "PIX",
  },
  {
    title: "GLOBOPLAY PADRÃO (SEM ANÚNCIOS)",
    price: "R$ 7,45 - PIX (Mensal)",
    status: "disponível",
    access: "CONVITE POR E-MAIL",
    telegram_username: "@euothiagoandrade",
    whatsapp_number: "5565984450752",
    added_date: "03/05/2025",
    payment_method: "PIX",
  },
  {
    title: "Microsoft 365 Família 1T",
    price: "R$ 12 - PIX (Mensal)",
    status: "disponível",
    access: "Convite por E-mail",
    telegram_username: "@alessadinozzo",
    whatsapp_number: "5587991988684",
    added_date: "03/05/2025",
    payment_method: "PIX",
  },
  {
    title: "PERPLEXITY IA (Claude/ChatGpt/Gemini/Grok)",
    price: "R$ 10,00 - PIX (Mensal)",
    status: "disponível",
    access: "ATIVAÇÃO",
    telegram_username: "@evertonbazu",
    whatsapp_number: "5513992077804",
    added_date: "04/05/2025",
    payment_method: "PIX",
  },
  {
    title: "NETFLIX (DISPOSITIVOS MÓVEIS/TV)",
    price: "R$ 27,00 - PIX (Mensal)",
    status: "disponível",
    access: "CONVITE POR E-MAIL",
    telegram_username: "@EvandersonAraujo",
    whatsapp_number: "5531975374153",
    added_date: "04/05/2025",
    payment_method: "PIX",
  },
  {
    title: "MAX STANDARD",
    price: "R$ 10,00 - PIX (Mensal)",
    status: "disponível",
    access: "CONVITE POR E-MAIL",
    telegram_username: "@victordiesco",
    whatsapp_number: "5534992675225",
    added_date: "06/05/2025",
    payment_method: "PIX",
  },
  {
    title: "Globoplay Premium + Telecine",
    price: "R$18,00 - PIX (Mensal)",
    status: "disponível",
    access: "Email e Senha",
    telegram_username: "@alessadinozzo",
    whatsapp_number: "5587991988684",
    added_date: "06/05/2025",
    payment_method: "PIX",
  },
  {
    title: "BABBEL (Cursos de Idiomas)",
    price: "R$ 10,00 - PIX (Mensal)",
    status: "disponível",
    access: "LOGIN E SENHA",
    telegram_username: "@evertonbazu",
    whatsapp_number: "5513992077804",
    added_date: "06/05/2025",
    payment_method: "PIX",
  },
  {
    title: "YOUTUBE PREMIUM",
    price: "R$ 12,00 - PIX (Mensal)",
    status: "disponível",
    access: "CONVITE POR E-MAIL",
    telegram_username: "@pedro127",
    whatsapp_number: "5588992259940",
    added_date: "07/05/2025",
    payment_method: "PIX",
  },
  {
    title: "MICROSOFT 365",
    price: "R$ 180,00 - PIX (Anual)",
    status: "disponível",
    access: "CONVITE POR E-MAIL",
    telegram_username: "@victordiesco",
    whatsapp_number: "5534992675225",
    added_date: "07/05/2025",
    payment_method: "PIX",
  },
];

// Function to import all subscriptions
export const importAllSubscriptions = async () => {
  let added = 0;
  let errors = 0;
  
  try {
    // First, check if we already have subscriptions in the database
    const { count, error: countError } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error checking subscription count:', countError);
      return { success: false, message: 'Error checking existing subscriptions' };
    }
    
    // Only proceed if we have few or no subscriptions
    if (count && count > 10) {
      return { 
        success: true, 
        message: `Database already contains ${count} subscriptions. No import needed.` 
      };
    }
    
    // Process each subscription
    for (const subscription of subscriptionsData) {
      try {
        const preparedData = prepareSubscriptionForDB({
          ...subscription,
          header_color: '#3b82f6', // Default blue
          price_color: '#10b981', // Default green
          code: generateCode(),
        });
        
        const { error } = await supabase
          .from('subscriptions')
          .insert(preparedData);
        
        if (error) {
          console.error('Error adding subscription:', error);
          errors++;
        } else {
          added++;
        }
      } catch (err) {
        console.error('Error processing subscription:', err);
        errors++;
      }
    }
    
    return {
      success: added > 0,
      message: `Successfully imported ${added} subscriptions with ${errors} errors.`
    };
  } catch (error) {
    console.error('Bulk import error:', error);
    return { success: false, message: 'Error during bulk import' };
  }
};

// Export a function that can be called directly
export const importSubscriptionsIfNeeded = async () => {
  console.log('Checking if sample subscriptions need to be imported...');
  const result = await importAllSubscriptions();
  console.log(result.message);
  return result;
};
