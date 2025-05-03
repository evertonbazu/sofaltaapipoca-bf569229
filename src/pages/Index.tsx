
import React from "react";
import SubscriptionCard from "@/components/SubscriptionCard";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-indigo p-4">
      <div className="max-w-md mx-auto my-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🍿Só Falta a Pipoca</h1>
          <p className="text-indigo-100">Assinaturas premium com preços exclusivos</p>
        </header>

        <div className="space-y-6">
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

        <footer className="mt-10 text-center text-indigo-100 text-sm">
          <p>Ofertas sujeitas a disponibilidade. Entre em contato para mais informações.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
