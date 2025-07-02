import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import SubscriptionFormCore from '@/components/forms/SubscriptionFormCore';

/**
 * Componente de formulário para submissão de anúncios pelos usuários
 * @version 3.8.0 - Refatorado para usar formulário compartilhado
 */

const SubmitSubscriptionForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Verificar se o usuário está logado
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        toast({
          title: "Acesso restrito",
          description: "Você precisa estar logado para enviar um anúncio.",
          variant: "destructive"
        });
        navigate('/auth');
      }
    };
    checkUser();
  }, [navigate, toast]);

  // Manipulador para envio do formulário
  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Processar título personalizado
      const finalTitle = data.title === "Personalizado" ? data.customTitle : data.title;

      // Processar método de pagamento personalizado
      const finalPaymentMethod = data.paymentMethod === "OUTRA FORMA" ? data.customPaymentMethod : data.paymentMethod;

      // Processar tipo de acesso personalizado
      const finalAccess = data.access === "OUTRO" ? data.customAccess : data.access;

      // Gerar código único
      const { data: code, error: codeError } = await supabase.rpc('generate_subscription_code');
      if (codeError) throw codeError;

      // Adicionar asterisco ao título para anúncios de membros
      const titleWithAsterisk = `* ${finalTitle.toUpperCase()}`;

      // Enviar para o banco de dados
      const { error } = await supabase.from('subscriptions').insert({
        full_name: data.fullName,
        title: titleWithAsterisk,
        custom_title: data.title === "Personalizado" ? data.customTitle : null,
        price: data.price,
        payment_method: finalPaymentMethod,
        status: data.status,
        access: finalAccess.toUpperCase(),
        header_color: 'bg-blue-600',
        price_color: 'text-blue-600',
        whatsapp_number: data.whatsappNumber,
        telegram_username: data.telegramUsername,
        added_date: new Date().toLocaleDateString('pt-BR'),
        code: code,
        user_id: userId,
        pix_key: data.pixKey,
        category: data.category,
        featured: false,
        visible: false
      });

      if (error) throw error;

      toast({
        title: "Anúncio enviado",
        description: "Seu anúncio foi enviado com sucesso e será revisado pelo administrador."
      });

      navigate('/');
    } catch (error) {
      console.error('Erro ao enviar anúncio:', error);
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar seu anúncio. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Envie seu anúncio</CardTitle>
        <CardDescription>
          Preencha o formulário abaixo para adicionar seu anúncio ao site.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SubscriptionFormCore
          mode="create"
          onSubmit={handleSubmit}
          isLoading={isLoading}
          showFullNameField={true}
          showModificationReason={false}
        />
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button type="button" variant="outline" onClick={() => navigate('/')} disabled={isLoading}>
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubmitSubscriptionForm;