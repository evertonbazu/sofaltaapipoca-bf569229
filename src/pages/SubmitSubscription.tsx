
import React from 'react';
import NavBar from '@/components/NavBar';
import SubmitSubscriptionForm from '@/components/SubmitSubscriptionForm';

const SubmitSubscription = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Anunciar no Só Falta a Pipoca</h1>
        <p className="mb-6 text-gray-600">
          Preencha o formulário abaixo para enviar seu anúncio para aprovação dos administradores.
          Após a análise, seu anúncio será publicado no site.
        </p>
        
        <SubmitSubscriptionForm />
      </div>
    </div>
  );
};

export default SubmitSubscription;
