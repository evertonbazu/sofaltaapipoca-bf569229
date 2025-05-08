
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Home } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import ContactForm from '@/components/ContactForm';

const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  
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
            
            {authState.user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm">Olá, {authState.user.username || 'Usuário'}</span>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/auth')}
              >
                Entrar
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-3 sm:px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Fale Conosco</h1>
          <p className="text-gray-600 mb-6">
            Tem alguma dúvida ou sugestão? Preencha o formulário abaixo e entraremos em contato o mais breve possível.
          </p>
          
          <ContactForm />
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
