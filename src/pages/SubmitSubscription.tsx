
import React, { useEffect } from 'react';
import NavBar from '@/components/NavBar';
import SubmitSubscriptionForm from '@/components/SubmitSubscriptionForm';
import { useTelegramFieldModifier } from '@/components/SubmitSubscriptionForm';
import { supabase } from '@/integrations/supabase/client';

const SubmitSubscription = () => {
  // Use our custom hook to modify the Telegram field
  useTelegramFieldModifier();
  
  // Effect to update the "Outro" option to "Personalizado" in the title dropdown
  useEffect(() => {
    const updateFormOptions = async () => {
      try {
        // First, get all category options
        const { data, error } = await supabase
          .from('form_options')
          .select('*')
          .eq('type', 'category')
          .order('position', { ascending: true });
          
        if (error) {
          console.error('Erro ao buscar opções de formulário:', error);
          return;
        }
        
        // Find the "Outro" option
        const outroOption = data.find(option => option.value === 'Outro' || option.label === 'Outro');
        
        if (outroOption) {
          // Update to "Personalizado" and move to top position
          await supabase
            .from('form_options')
            .update({ 
              value: 'Personalizado',
              label: 'Personalizado',
              position: 0  // Set to position 0 to ensure it appears first
            })
            .eq('id', outroOption.id);
        }
      } catch (error) {
        console.error('Erro ao atualizar opção do formulário:', error);
      }
    };
    
    updateFormOptions();
  }, []);
  
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
