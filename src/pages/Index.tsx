import React, { useState, useEffect, useRef } from "react";
import SubscriptionCard from "@/components/SubscriptionCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const Index = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const subscriptionRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  
  // Update date/time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    
    const normalizedSearchTerm = searchTerm.toLowerCase();
    const keys = Object.keys(subscriptionRefs.current);
    
    for (const key of keys) {
      if (key.toLowerCase().includes(normalizedSearchTerm)) {
        const element = subscriptionRefs.current[key];
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.classList.add("search-highlight");
          setTimeout(() => {
            element.classList.remove("search-highlight");
          }, 2000);
          break;
        }
      }
    }
    
    setIsSearching(false);
  };
  
  const formattedDate = currentDateTime.toLocaleDateString("pt-BR");
  const formattedTime = currentDateTime.toLocaleTimeString("pt-BR", {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const version = "1.0.0";
  
  return (
    <div className="min-h-screen bg-gradient-indigo p-4">
      <div className="max-w-md mx-auto my-8 relative">
        <div className="absolute right-0 top-0 w-full md:w-auto">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Buscar assinatura..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-48"
            />
            <Button type="submit" size="sm" disabled={isSearching}>
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>
        
        <header className="text-center mb-8 pt-12">
          <h1 className="text-3xl font-bold text-white mb-2">🍿Só Falta a Pipoca</h1>
          <p className="text-indigo-100">Assinaturas premium com preços exclusivos</p>
        </header>

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
              centerTitle={true}
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
          
          <div ref={el => subscriptionRefs.current["PARAMOUNT PREMIUM"] = el}>
            <SubscriptionCard
              title="PARAMOUNT PREMIUM"
              price="R$ 10,00"
              paymentMethod="PIX (Mensal)"
              status="Assinado (3 vagas)"
              access="LOGIN E SENHA"
              headerColor="bg-blue-500"
              priceColor="text-blue-600"
              whatsappNumber="5562982292725"
              telegramUsername="DonaMariaRosa"
              centerTitle={true}
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
            centerTitle={true}
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
            centerTitle={true}
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
            centerTitle={true}
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
            centerTitle={true}
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
            centerTitle={true}
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
            centerTitle={true}
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
            centerTitle={true}
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
            centerTitle={true}
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
            centerTitle={true}
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
            centerTitle={true}
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
            centerTitle={true}
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
            centerTitle={true}
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
            centerTitle={true}
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
            centerTitle={true}
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
            centerTitle={true}
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
            centerTitle={true}
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
            centerTitle={true}
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
            centerTitle={true}
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
            centerTitle={true}
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
            centerTitle={true}
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
            centerTitle={true}
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
            centerTitle={true}
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
            centerTitle={true}
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
            centerTitle={true}
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
            centerTitle={true}
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
            centerTitle={true}
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
            centerTitle={true}
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
            centerTitle={true}
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
            centerTitle={true}
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
            centerTitle={true}
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
            centerTitle={true}
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
            centerTitle={true}
          />
        </div>

        <footer className="mt-10 text-center text-indigo-100 text-sm">
          <p>Ofertas sujeitas a disponibilidade. Entre em contato para mais informações.</p>
          <p className="mt-2">Atualizado em: {formattedDate} às {formattedTime}</p>
          <p className="mt-1">Versão: {version}</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
