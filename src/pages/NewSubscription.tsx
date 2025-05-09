
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Home } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import SubscriptionSubmissionForm from '@/components/SubscriptionSubmissionForm';

const NewSubscription: React.FC = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();
  
  if (!authState.user) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <div className="bg-white shadow-sm">
          <div className="container mx-auto px-3 sm:px-4 py-2">
            <div className="flex justify-between items-center">
              <Button 
                variant="ghost" 
                className="font-medium px-3"
                onClick={() => navigate('/')}
              >
                <Home className="h-4 w-4 mr-2" /> 
                Início
              </Button>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-3 sm:px-4 py-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Acesso Restrito</h2>
            <p>Você precisa estar logado para cadastrar anúncios.</p>
            <Button onClick={() => navigate('/auth')}>Fazer Login</Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-2">
          <div className="flex justify-between items-center">
            <Button 
              variant="ghost" 
              className="font-medium px-3"
              onClick={() => navigate('/')}
            >
              <Home className="h-4 w-4 mr-2" /> 
              Início
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm">Olá, {authState.user.username || 'Usuário'}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-3 sm:px-4 py-8 w-full">
        <h1 className="text-2xl font-bold mb-6">Cadastrar Novo Anúncio</h1>
        
        <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 w-full">
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="font-medium text-blue-800">Instruções para cadastro:</h3>
            <ul className="list-disc pl-5 mt-2 text-sm text-blue-700">
              <li>Preencha todos os campos obrigatórios marcados com *</li>
              <li>O comprovante de assinatura é opcional</li>
              <li>Seu anúncio será revisado antes de ser publicado</li>
              <li>Após aprovação, ele aparecerá na página principal</li>
            </ul>
          </div>
          
          <div className="w-full">
            <SubscriptionSubmissionForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewSubscription;
