
import { supabase } from '@/integrations/supabase/client';
import { parseSubscription } from './importSubscriptions';

// This is the list of subscriptions from the user message
const subscriptionsText = `ANÚNCIOS SÓ FALTA A PIPOCA 🍿, [09/04/2025 09:21]
🖥 PARAMOUNT PADRÃO (MELI+)
🏦 R$ 6,00 - PIX (Mensal)
 📌Assinado (2 vagas)
🔐 LOGIN E SENHA
📩@Eduardok10cds
📱 https://wa.me/5575999997951

ANÚNCIOS SÓ FALTA A PIPOCA 🍿, [15/04/2025 10:08]
🖥 YOUTUBE PREMIUM
🏦 120,00 /ano - PIX (Mensal)
 📌Assinado (2 vagas)
🔐 CONVITE POR E-MAIL
📩@Rastelinho
📱 https://wa.me/5527988292875

ANÚNCIOS SÓ FALTA A PIPOCA 🍿, [15/04/2025 10:09]
🖥 NETFLIX (DISPOSITIVOS MÓVEIS/TV)
🏦 R$ 32,00 - PIX (Mensal)
 📌Assinado (1 vaga)
🔐 CONVITE POR E-MAIL
📩@EvandersonAraujo
📱 https://wa.me/5531975374153

ANÚNCIOS SÓ FALTA A PIPOCA 🍿, [16/04/2025 09:49]
🖥 GOOGLE ONE IA PREMIUM 2TB COM GEMINI ADVANCED 2.5
🏦 R$ 20,00 - PIX (Mensal)
 📌Assinado (4 vagas)
🔐 CONVITE POR E-MAIL
📩@brenokennedyof
📱 https://wa.me/5598984045368

ANÚNCIOS SÓ FALTA A PIPOCA 🍿, [16/04/2025 10:41]
🖥 ALURA PLUS
🏦 R$ 20,00 - PIX (Mensal)
 📌Assinado
🔐 LOGIN E SENHA
📩 @evertonbazu
📱 https://wa.me/5513992077804

ANÚNCIOS SÓ FALTA A PIPOCA 🍿, [18/04/2025 18:13]
🖥 GRAN CURSOS ILIMITADO AMIGOS
🏦 R$ 34,00 - PIX (Mensal)
 📌Assinado (1 vaga)
🔐 CONVITE POR E-MAIL
📩@DonaMariaRosa
📱 https://wa.me/5562982292725

ANÚNCIOS SÓ FALTA A PIPOCA 🍿, [19/04/2025 18:10]
🖥 SPOTIFY
🏦 R$ 7,00 - PIX (Mensal)
 📌Assinado (2 vagas)
🔐 CONVITE POR E-MAIL
📩@pedro127
📱 https://wa.me/5588992259940

ANÚNCIOS SÓ FALTA A PIPOCA 🍿, [19/04/2025 18:12]
🖥 NETFLIX 4K + APPLE TV + GLOBO PLAY PREMIUM SEM ANUNCIO + 27 CANAIS
🏦 R$ 29,99 - PIX (Mensal)
 📌Assinado (2 vagas)
🔐 LOGIN E SENHA
📩@OliveiraBoB
📱 https://wa.me/5585992166014

ANÚNCIOS SÓ FALTA A PIPOCA 🍿, [21/04/2025 19:40]
🖥 AMAZON PRIME VIDEO
🏦 R$ 5,50 - PIX (Mensal)
 📌Assinado (2 vagas)
🔐 ATIVAÇÃO POR CÓDIGO.
📩@BrunnoSSantos
📱 https://wa.me/5511912659702

ANÚNCIOS SÓ FALTA A PIPOCA 🍿, [21/04/2025 19:41]
🖥 CRUNCHYROLL
🏦 R$ 5,75 - PIX (Mensal)
 📌Assinado (2 vagas)
🔐 ATIVAÇÃO POR CÓDIGO
📩@BrunnoSSantos
📱 https://wa.me/5511912659702

ANÚNCIOS SÓ FALTA A PIPOCA 🍿, [21/04/2025 19:41]
🖥 SPOTIFY
🏦 R$ 7,50 - PIX (Mensal)
 📌Assinado (2 vagas)
🔐 CONVITE POR E-MAIL
📩@BrunnoSSantos
📱 https://wa.me/5511912659702

ANÚNCIOS SÓ FALTA A PIPOCA 🍿, [21/04/2025 19:42]
🖥 DISNEY+ PADRÃO (COM ANÚNCIOS)
🏦 R$ 8,00 - PIX (Mensal)
 📌Assinado (2 vagas)
🔐 LOGIN E SENHA
📩@kiwi_docinho
📱 https://wa.me/5583986510421

ANÚNCIOS SÓ FALTA A PIPOCA 🍿, [25/04/2025 09:02]
🖥 CANVA
🏦 R$ 10,00 - PIX (Mensal)
 📌Assinado
🔐 CONVITE
📩 @evertonbazu
📱 https://wa.me/5513992077804

ANÚNCIOS SÓ FALTA A PIPOCA 🍿, [27/04/2025 10:51]
🖥 NETFLIX (DISPOSITIVOS MÓVEIS/TV)
🏦 R$ 30,00 - PIX (Mensal)
 📌Assinado (1 vaga)
🔐 LOGIN E SENHA
📩@OLIVEIRABOB
📱 https://wa.me/5585992166014

ANÚNCIOS SÓ FALTA A PIPOCA 🍿, [27/04/2025 10:52]
🖥 APPLE TV+
🏦 R$ 6,90 - PIX (Mensal)
 📌Assinado (1 vaga)
🔐 LOGIN E SENHA
📩@ojuniormauricio
📱 https://wa.me/5574981207317

ANÚNCIOS SÓ FALTA A PIPOCA 🍿, [27/04/2025 13:56]
🖥 Netflix (Cel/PC)
🏦 R$ 15 - PIX (Mensal)
📌 Assinado
🔐 Email e Senha
📩 @alessadinozzo
📱https://wa.me/5587991988684

ANÚNCIOS SÓ FALTA A PIPOCA 🍿, [27/04/2025 13:58]
🖥 Apple TV 
🏦 R$ 7 - PIX (Mensal)
📌 Assinado
🔐 Email e Senha
📩 @alessadinozzo
📱https://wa.me/5587991988684

ANÚNCIOS SÓ FALTA A PIPOCA 🍿, [29/04/2025 12:46]
🖥 MCAFEE TOTAL PROTECTION
🏦 R$ 5,00 - PIX (Mensal)
 📌Assinado (2 vagas)
🔐 ATIVAÇÃO
📩@otaviodw
📱 https://wa.me/5527997692531

ANÚNCIOS SÓ FALTA A PIPOCA 🍿, [01/05/2025 11:06]
🖥 PLAYPLUS
🏦 R$ 4,50 - PIX (Mensal)
 📌Assinado (4 vagas)
🔐 LOGIN E SENHA
📩@brenokennedyof
📱 https://wa.me/5598984045368

ANÚNCIOS SÓ FALTA A PIPOCA 🍿, [01/05/2025 11:06]
🖥 MUBI
🏦 R$ 15,00 - PIX (Mensal)
 📌Assinado (1 vaga)
🔐 ATIVAÇÃO
📩@brenokennedyof
📱 https://wa.me/5598984045368

ANÚNCIOS SÓ FALTA A PIPOCA 🍿, [01/05/2025 11:08]
🖥 MAX STANDARD
🏦 R$ 7,00 - PIX (Mensal)
 📌Assinado (1 vaga)
🔐 ATIVAÇÃO
📩@arnaldojhony
📱 https://wa.me/5575992630618

ANÚNCIOS SÓ FALTA A PIPOCA 🍿, [01/05/2025 16:26]
🖥 PARAMOUNT PREMIUM
🏦 R$ 10,00 - PIX (Mensal)
 📌Assinado (3 vagas)
🔐 LOGIN E SENHA
📩@OLIVEIRABOB
📱 https://wa.me/5585992166014

ANÚNCIOS SÓ FALTA A PIPOCA 🍿, [03/05/2025 19:15]
🖥 GLOBO PLAY PREMIUM + 27 CANAIS + APPLE TV+
🏦 R$ 16,90 - PIX (Mensal)
 📌Assinado (4 vagas)
🔐 CONVITE POR E-MAIL
📩@OLIVEIRABOB
📱 https://wa.me/5585992166014

ANÚNCIOS SÓ FALTA A PIPOCA 🍿, [03/05/2025 19:16]
🖥 CRUNCHYROLL
🏦 R$ 9,00 - PIX (Mensal)
 📌Aguardando Membros (4 vagas)
🔐 LOGIN E SENHA
📩@Thamy78
📱 https://wa.me/5586995736762

ANÚNCIOS SÓ FALTA A PIPOCA 🍿, [03/05/2025 19:20]
🖥 GLOBOPLAY PADRÃO (SEM ANÚNCIOS)
🏦 R$ 7,45 - PIX (Mensal)
 📌Assinado (1 vaga)
🔐 CONVITE POR E-MAIL
📩@euothiagoandrade
📱 https://wa.me/5565984450752

ANÚNCIOS SÓ FALTA A PIPOCA 🍿, [03/05/2025 21:01]
🖥 Microsoft 365 Família 1T
🏦 R$ 12 - PIX (Mensal)
📌 Assinado
🔐 Convite por E-mail 
📩 @alessadinozzo
📱https://wa.me/5587991988684

ANÚNCIOS SÓ FALTA A PIPOCA 🍿, [04/05/2025 10:59]
🖥 PERPLEXITY IA (Claude/ChatGpt/Gemini/Grok)
🏦 R$ 10,00 - PIX (Mensal)
 📌Assinado
🔐 ATIVAÇÃO
📩 @evertonbazu
📱 https://wa.me/5513992077804

ANÚNCIOS SÓ FALTA A PIPOCA 🍿, [04/05/2025 11:11]
🖥 NETFLIX (DISPOSITIVOS MÓVEIS/TV)
🏦 R$ 27,00 - PIX (Mensal)
 📌Assinado (1 vaga)
🔐 CONVITE POR E-MAIL
📩@EvandersonAraujo
📱 https://wa.me/5531975374153

ANÚNCIOS SÓ FALTA A PIPOCA 🍿, [06/05/2025 10:39]
🖥 MAX STANDARD
🏦 R$ 10,00 - PIX (Mensal)
 📌Assinado (1 vaga)
🔐 CONVITE POR E-MAIL
📩@victordiesco
📱 https://wa.me/5534992675225

📅 Adicionado em: 06/05/2025

ANÚNCIOS SÓ FALTA A PIPOCA 🍿, [06/05/2025 10:41]
🖥 Globoplay Premium + Telecine
🏦 R$18,00 - PIX (Mensal)
📌 Assinado
🔐 Email e Senha
📩 @alessadinozzo
📱https://wa.me/5587991988684

📅 Adicionado em: 06/05/2025

ANÚNCIOS SÓ FALTA A PIPOCA 🍿, [06/05/2025 10:42]
🖥 BABBEL (Cursos de Idiomas)
🏦 R$ 10,00 - PIX (Mensal)
 📌Assinado (1 Vaga)
🔐 LOGIN E SENHA
📩@evertonbazu
📱 https://wa.me/5513992077804

📅 Adicionado em: 06/05/2025

ANÚNCIOS SÓ FALTA A PIPOCA 🍿, [07/05/2025 19:16]
🖥 YOUTUBE PREMIUM
🏦 R$ 12,00 - PIX (Mensal)
 📌Assinado (2 vagas)
🔐 CONVITE POR E-MAIL
📩@pedro127
📱 https://wa.me/5588992259940

📅 Adicionado em: 07/05/2025

ANÚNCIOS SÓ FALTA A PIPOCA 🍿, [07/05/2025 19:22]
🖥 MICROSOFT 365
🏦 R$ 180,00 - PIX (Anual)
 📌Assinado (1 vaga)
🔐 CONVITE POR E-MAIL
📩@victordiesco
📱 https://wa.me/5534992675225

📅 Adicionado em: 07/05/2025`;

/**
 * Imports all the current subscriptions directly from the text.
 * This function executes immediately on import to add all the subscriptions to the database.
 */
export const importAllSubscriptions = async () => {
  console.log("Starting import of all current subscriptions...");
  
  // Split by telegram group message pattern
  const subscriptionTexts = subscriptionsText.split(/ANÚNCIOS SÓ FALTA A PIPOCA 🍿, \[\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}\]/g)
    .filter(text => text.trim().length > 0);
  
  console.log(`Found ${subscriptionTexts.length} subscriptions to import`);
  
  let successCount = 0;
  let errorCount = 0;
  const featuredSubs = [0, 2, 7, 13, 20, 27]; // Indexes of subscriptions to feature (will make these featured)
  
  for (let i = 0; i < subscriptionTexts.length; i++) {
    const parsed = parseSubscription(subscriptionTexts[i]);
    
    if (parsed) {
      try {
        // Make certain subscriptions featured based on index
        const featured = featuredSubs.includes(i);
        
        // Make sure all required fields are present
        const requiredFields = ['title', 'price', 'status', 'access', 'header_color', 'price_color', 'whatsapp_number', 'telegram_username', 'code'];
        const missingFields = requiredFields.filter(field => !parsed[field]);
        
        if (missingFields.length > 0) {
          console.error(`Missing required fields: ${missingFields.join(', ')}`, parsed);
          errorCount++;
          continue;
        }
        
        const { error } = await supabase
          .from('subscriptions')
          .insert({
            title: parsed.title,
            price: parsed.price,
            status: parsed.status,
            access: parsed.access,
            header_color: parsed.header_color || '#3b82f6',
            price_color: parsed.price_color || '#10b981',
            whatsapp_number: parsed.whatsapp_number,
            telegram_username: parsed.telegram_username,
            code: parsed.code || generateCode(),
            payment_method: parsed.payment_method || 'PIX',
            added_date: parsed.added_date || new Date().toLocaleDateString('pt-BR'),
            featured
          });
          
        if (error) {
          console.error('Error inserting subscription:', error);
          errorCount++;
        } else {
          successCount++;
          console.log(`Successfully imported subscription: ${parsed.title}`);
        }
      } catch (err) {
        console.error('Error in Supabase insert:', err);
        errorCount++;
      }
    } else {
      errorCount++;
    }
  }
  
  console.log(`Import completed: ${successCount} successful, ${errorCount} errors`);
  return { success: successCount, errors: errorCount };
};

// Auto-execute the import function when this file is imported
importAllSubscriptions().catch(console.error);
