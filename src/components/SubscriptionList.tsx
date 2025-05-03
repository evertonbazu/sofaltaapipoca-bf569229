import React from "react";
import SubscriptionCard from "@/components/SubscriptionCard";

interface SubscriptionListProps {
  subscriptionRefs: React.MutableRefObject<{[key: string]: HTMLDivElement | null}>;
}

const SubscriptionList: React.FC<SubscriptionListProps> = ({ subscriptionRefs }) => {
  return (
    <div className="space-y-6">
      <div ref={el => subscriptionRefs.current["SUPER DUOLINGO PLUS - ANUAL"] = el}>
        <SubscriptionCard
          title="SUPER DUOLINGO PLUS - ANUAL"
          price="R$ 58,24"
          paymentMethod="PIX (ANUAL)"
          status="Assinado (1 vaga)"
          access="CONVITE POR E-MAIL"
          headerColor="bg-green-500"
          priceColor="text-green-600"
          whatsappNumber="5565984450752"
          telegramUsername="euothiagoandrade"
        />
      </div>

      <div ref={el => subscriptionRefs.current["GLOBOPLAY PADRÃO (SEM ANÚNCIOS)"] = el}>
        <SubscriptionCard
          title="GLOBOPLAY PADRÃO (SEM ANÚNCIOS)"
          price="R$ 7,45"
          paymentMethod="PIX (Mensal)"
          status="Assinado (1 vaga)"
          access="CONVITE POR E-MAIL"
          headerColor="bg-blue-500"
          priceColor="text-blue-600"
          whatsappNumber="5565984450752"
          telegramUsername="euothiagoandrade"
        />
      </div>
      
      <SubscriptionCard
        title="LOOKE"
        price="R$ 6,00"
        paymentMethod="PIX (Mensal)"
        status="Assinado (1 vaga)"
        access="LOGIN E SENHA"
        headerColor="bg-blue-500"
        priceColor="text-blue-600"
        whatsappNumber="5562982292725"
        telegramUsername="DonaMariaRosa"
      />
      
      <SubscriptionCard
        title="NETFLIX (Dispositivos móveis)"
        price="R$ 15,00"
        paymentMethod="PIX (Mensal)"
        status="Assinado (1 Vaga)"
        access="LOGIN E SENHA"
        headerColor="bg-blue-500"
        priceColor="text-blue-600"
        whatsappNumber="5513992077804"
        telegramUsername="evertonbazu"
      />
      
      <SubscriptionCard
        title="VIKI E KOCOWA +"
        price="R$ 12,00"
        paymentMethod="PIX (Mensal)"
        status="Assinado (4 vagas)"
        access="LOGIN E SENHA"
        headerColor="bg-blue-500"
        priceColor="text-blue-600"
        whatsappNumber="86995736762"
        telegramUsername="Thamy78"
      />
      
      <SubscriptionCard
        title="PARAMOUNT PADRÃO (MELI+)"
        price="R$ 6,00"
        paymentMethod="PIX (Mensal)"
        status="Assinado (2 vagas)"
        access="LOGIN E SENHA"
        headerColor="bg-blue-500"
        priceColor="text-blue-600"
        whatsappNumber="5575999997951"
        telegramUsername="Eduardok10cds"
      />
      
      <SubscriptionCard
        title="BABBEL (Cursos de Idiomas)"
        price="R$ 10,00"
        paymentMethod="PIX (Mensal)"
        status="Assinado (1 Vaga)"
        access="LOGIN E SENHA"
        headerColor="bg-blue-500"
        priceColor="text-blue-600"
        whatsappNumber="5513992077804"
        telegramUsername="evertonbazu"
      />
      
      <SubscriptionCard
        title="AMAZON PRIME VÍDEO"
        price="R$ 8,00"
        paymentMethod="PIX (Mensal)"
        status="Assinado (1 Vaga)"
        access="LOGIN E SENHA"
        headerColor="bg-blue-500"
        priceColor="text-blue-600"
        whatsappNumber="5513992077804"
        telegramUsername="evertonbazu"
      />
      
      <SubscriptionCard
        title="YOUTUBE PREMIUM"
        price="120,00 /ano"
        paymentMethod="PIX (Mensal)"
        status="Assinado (2 vagas)"
        access="CONVITE POR E-MAIL"
        headerColor="bg-blue-500"
        priceColor="text-blue-600"
        whatsappNumber="5527988292875"
        telegramUsername="Rastelinho"
      />
      
      <SubscriptionCard
        title="NETFLIX (DISPOSITIVOS MÓVEIS/TV)"
        price="R$ 32,00"
        paymentMethod="PIX (Mensal)"
        status="Assinado (1 vaga)"
        access="CONVITE POR E-MAIL"
        headerColor="bg-blue-500"
        priceColor="text-blue-600"
        whatsappNumber="5531975374153"
        telegramUsername="EvandersonAraujo"
      />
      
      <SubscriptionCard
        title="GOOGLE ONE IA PREMIUM 2TB COM GEMINI ADVANCED 2.5"
        price="R$ 20,00"
        paymentMethod="PIX (Mensal)"
        status="Assinado (4 vagas)"
        access="CONVITE POR E-MAIL"
        headerColor="bg-blue-500"
        priceColor="text-blue-600"
        whatsappNumber="5598984045368"
        telegramUsername="brenokennedyof"
      />
      
      <SubscriptionCard
        title="ALURA PLUS"
        price="R$ 20,00"
        paymentMethod="PIX (Mensal)"
        status="Assinado"
        access="LOGIN E SENHA"
        headerColor="bg-blue-500"
        priceColor="text-blue-600"
        whatsappNumber="5513992077804"
        telegramUsername="evertonbazu"
      />
      
      <SubscriptionCard
        title="GRAN CURSOS ILIMITADO AMIGOS"
        price="R$ 34,00"
        paymentMethod="PIX (Mensal)"
        status="Assinado (1 vaga)"
        access="CONVITE POR E-MAIL"
        headerColor="bg-blue-500"
        priceColor="text-blue-600"
        whatsappNumber="5562982292725"
        telegramUsername="DonaMariaRosa"
      />
      
      <SubscriptionCard
        title="SPOTIFY"
        price="R$ 7,00"
        paymentMethod="PIX (Mensal)"
        status="Assinado (2 vagas)"
        access="CONVITE POR E-MAIL"
        headerColor="bg-blue-500"
        priceColor="text-blue-600"
        whatsappNumber="5588992259940"
        telegramUsername="pedro127"
      />
      
      <SubscriptionCard
        title="NETFLIX 4K + APPLE TV + GLOBO PLAY PREMIUM SEM ANUNCIO + 27 CANAIS"
        price="R$ 29,99"
        paymentMethod="PIX (Mensal)"
        status="Assinado (2 vagas)"
        access="LOGIN E SENHA"
        headerColor="bg-blue-500"
        priceColor="text-blue-600"
        whatsappNumber="5585992166014"
        telegramUsername="OliveiraBoB"
      />
      
      <SubscriptionCard
        title="AMAZON PRIME VIDEO"
        price="R$ 5,50"
        paymentMethod="PIX (Mensal)"
        status="Assinado (2 vagas)"
        access="ATIVAÇÃO POR CÓDIGO."
        headerColor="bg-blue-500"
        priceColor="text-blue-600"
        whatsappNumber="5511912659702"
        telegramUsername="BrunnoSSantos"
      />
      
      <SubscriptionCard
        title="CRUNCHYROLL"
        price="R$ 5,75"
        paymentMethod="PIX (Mensal)"
        status="Assinado (2 vagas)"
        access="ATIVAÇÃO POR CÓDIGO"
        headerColor="bg-blue-500"
        priceColor="text-blue-600"
        whatsappNumber="5511912659702"
        telegramUsername="BrunnoSSantos"
      />
      
      <SubscriptionCard
        title="SPOTIFY"
        price="R$ 7,50"
        paymentMethod="PIX (Mensal)"
        status="Assinado (2 vagas)"
        access="CONVITE POR E-MAIL"
        headerColor="bg-blue-500"
        priceColor="text-blue-600"
        whatsappNumber="5511912659702"
        telegramUsername="BrunnoSSantos"
      />
      
      <SubscriptionCard
        title="DISNEY+ PADRÃO (COM ANÚNCIOS)"
        price="R$ 8,00"
        paymentMethod="PIX (Mensal)"
        status="Assinado (2 vagas)"
        access="LOGIN E SENHA"
        headerColor="bg-blue-500"
        priceColor="text-blue-600"
        whatsappNumber="5583986510421"
        telegramUsername="kiwi_docinho"
      />
      
      <SubscriptionCard
        title="CANVA"
        price="R$ 10,00"
        paymentMethod="PIX (Mensal)"
        status="Assinado"
        access="CONVITE"
        headerColor="bg-blue-500"
        priceColor="text-blue-600"
        whatsappNumber="5513992077804"
        telegramUsername="evertonbazu"
      />
      
      <SubscriptionCard
        title="NETFLIX (DISPOSITIVOS MÓVEIS/TV)"
        price="R$ 30,00"
        paymentMethod="PIX (Mensal)"
        status="Assinado (1 vaga)"
        access="LOGIN E SENHA"
        headerColor="bg-blue-500"
        priceColor="text-blue-600"
        whatsappNumber="5585992166014"
        telegramUsername="OLIVEIRABOB"
      />
      
      <SubscriptionCard
        title="APPLE TV+"
        price="R$ 6,90"
        paymentMethod="PIX (Mensal)"
        status="Assinado (1 vaga)"
        access="LOGIN E SENHA"
        headerColor="bg-blue-500"
        priceColor="text-blue-600"
        whatsappNumber="5574981207317"
        telegramUsername="ojuniormauricio"
      />
      
      <SubscriptionCard
        title="Netflix (Cel/PC)"
        price="R$ 15"
        paymentMethod="PIX (Mensal)"
        status="Assinado"
        access="Email e Senha"
        headerColor="bg-blue-500"
        priceColor="text-blue-600"
        whatsappNumber="5587991988684"
        telegramUsername="alessadinozzo"
      />
      
      <SubscriptionCard
        title="Apple TV"
        price="R$ 7"
        paymentMethod="PIX (Mensal)"
        status="Assinado"
        access="Email e Senha"
        headerColor="bg-blue-500"
        priceColor="text-blue-600"
        whatsappNumber="5587991988684"
        telegramUsername="alessadinozzo"
      />
      
      <SubscriptionCard
        title="MCAFEE TOTAL PROTECTION"
        price="R$ 5,00"
        paymentMethod="PIX (Mensal)"
        status="Assinado (2 vagas)"
        access="ATIVAÇÃO"
        headerColor="bg-blue-500"
        priceColor="text-blue-600"
        whatsappNumber="5527997692531"
        telegramUsername="otaviodw"
      />
      
      <SubscriptionCard
        title="PLAYPLUS"
        price="R$ 4,50"
        paymentMethod="PIX (Mensal)"
        status="Assinado (4 vagas)"
        access="LOGIN E SENHA"
        headerColor="bg-blue-500"
        priceColor="text-blue-600"
        whatsappNumber="5598984045368"
        telegramUsername="brenokennedyof"
      />
      
      <SubscriptionCard
        title="MUBI"
        price="R$ 15,00"
        paymentMethod="PIX (Mensal)"
        status="Assinado (1 vaga)"
        access="ATIVAÇÃO"
        headerColor="bg-blue-500"
        priceColor="text-blue-600"
        whatsappNumber="5598984045368"
        telegramUsername="brenokennedyof"
      />
      
      <SubscriptionCard
        title="MAX PLATINUM - ANUAL"
        price="R$ 70,00"
        paymentMethod="PIX (Anual)"
        status="Aguardando Membros (4 vagas)"
        access="LOGIN E SENHA"
        headerColor="bg-blue-500"
        priceColor="text-blue-600"
        whatsappNumber="5561998013373"
        telegramUsername="andrefpc"
      />
      
      <SubscriptionCard
        title="MAX STANDARD"
        price="R$ 7,00"
        paymentMethod="PIX (Mensal)"
        status="Assinado (1 vaga)"
        access="ATIVAÇÃO"
        headerColor="bg-blue-500"
        priceColor="text-blue-600"
        whatsappNumber="5575992630618"
        telegramUsername="arnaldojhony"
      />
      
      <SubscriptionCard
        title="PARAMOUNT PREMIUM"
        price="R$ 10,00"
        paymentMethod="PIX (Mensal)"
        status="Assinado (3 vagas)"
        access="LOGIN E SENHA"
        headerColor="bg-blue-500"
        priceColor="text-blue-600"
        whatsappNumber="5585992166014"
        telegramUsername="OLIVEIRABOB"
      />
      
      <SubscriptionCard
        title="APPLE ONE (2TB)"
        price="R$ 20,00"
        paymentMethod="PIX (Mensal)"
        status="Assinado (1 vaga)"
        access="CONVITE POR E-MAIL"
        headerColor="bg-blue-500"
        priceColor="text-blue-600"
        whatsappNumber="5598984045368"
        telegramUsername="brenokennedyof"
      />
      
      <SubscriptionCard
        title="GLOBO PLAY PREMIUM + 27 CANAIS + APPLE TV+"
        price="R$ 16,90"
        paymentMethod="PIX (Mensal)"
        status="Assinado (4 vagas)"
        access="CONVITE POR E-MAIL"
        headerColor="bg-blue-500"
        priceColor="text-blue-600"
        whatsappNumber="5585992166014"
        telegramUsername="OLIVEIRABOB"
      />
      
      <SubscriptionCard
        title="CRUNCHYROLL"
        price="R$ 9,00"
        paymentMethod="PIX (Mensal)"
        status="Aguardando Membros (4 vagas)"
        access="LOGIN E SENHA"
        headerColor="bg-blue-500"
        priceColor="text-blue-600"
        whatsappNumber="5586995736762"
        telegramUsername="Thamy78"
      />
      
      <SubscriptionCard
        title="YOUTUBE PREMIUM"
        price="R$ 10,00"
        paymentMethod="PIX (Mensal)"
        status="Aguardando Membros (5 vagas)"
        access="CONVITE POR E-MAIL"
        headerColor="bg-blue-500"
        priceColor="text-blue-600"
        whatsappNumber="5586998315604"
        telegramUsername="itallo92"
      />
    </div>
  );
};

export default SubscriptionList;
