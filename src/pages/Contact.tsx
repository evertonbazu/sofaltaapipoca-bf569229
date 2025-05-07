
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
          
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Informações de Contato</h2>
            <div className="space-y-2">
              <p className="flex items-center">
                <span className="font-medium mr-2">📱 WhatsApp:</span>
                <a href="https://wa.me/5513992077804" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  +55 (13) 99207-7804
                </a>
              </p>
              <p className="flex items-center">
                <span className="font-medium mr-2">📧 Email:</span>
                <a href="mailto:sr.bazu@gmail.com" className="text-blue-600 hover:underline">
                  sr.bazu@gmail.com
                </a>
              </p>
              <p className="flex items-center">
                <span className="font-medium mr-2">📌 Telegram:</span>
                <a href="https://t.me/evertonbazu" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  @evertonbazu
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
