
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import NavBar from '@/components/NavBar';
import { Loader2 } from 'lucide-react';

/**
 * Página de redirecionamento para códigos abreviados
 * @version 3.10.1
 */
const CodeRedirect: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const findSubscriptionByCode = async () => {
      if (!code) {
        console.error('Código não fornecido');
        navigate('/404');
        return;
      }

      console.log('Buscando assinatura com código:', code);

      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('code', code)
          .eq('visible', true)
          .single();

        if (error) {
          console.error('Erro ao buscar assinatura:', error);
          navigate('/404');
          return;
        }

        if (!data) {
          console.error('Assinatura não encontrada para o código:', code);
          navigate('/404');
          return;
        }

        console.log('Assinatura encontrada, redirecionando para:', `/subscription/${data.id}`);
        navigate(`/subscription/${data.id}`);
      } catch (err) {
        console.error('Erro ao buscar assinatura pelo código:', err);
        navigate('/404');
      }
    };

    findSubscriptionByCode();
  }, [code, navigate]);

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600">Redirecionando para a assinatura...</p>
            <p className="text-sm text-gray-500 mt-2">Código: {code}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeRedirect;
