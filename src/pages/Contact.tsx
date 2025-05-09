
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ContactForm from '@/components/ContactForm';

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
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
