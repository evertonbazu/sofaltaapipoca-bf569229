
import React from 'react';
import NavBar from '@/components/NavBar';
import SubmitSubscriptionForm from '@/components/SubmitSubscriptionForm';

/**
 * Página para submissão de anúncios pelos usuários
 * @version 3.7.0
 */
const SubmitSubscription = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Anunciar no Só Falta a Pipoca</h1>
        
        <div className="mb-6 text-center space-y-4">
          <p className="text-lg text-zinc-950">
            Preencha o formulário abaixo para enviar seu anúncio para aprovação dos administradores.
          </p>
          
          <p className="text-lg text-zinc-950">
            Após a análise, seu anúncio será publicado no site.
          </p>
          
          <p className="text-lg font-bold text-red-600 bg-yellow-100 border border-yellow-300 rounded-lg p-3">
            SEU ANÚNCIO FICARÁ NO SITE POR DUAS SEMANAS, DEPOIS SERÁ EXCLUÍDO AUTOMATICAMENTE.
          </p>
          
          <p className="text-lg text-zinc-950">
            Para remover o anúncio manualmente vá em Meu Perfil&gt;Minhas Assinaturas.
          </p>
        </div>
        
        <SubmitSubscriptionForm />
      </div>
    </div>
  );
};

export default SubmitSubscription;
