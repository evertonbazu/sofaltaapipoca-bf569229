
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PendingSubscription {
  id: string;
  title: string;
  price: string;
  payment_method: string;
  whatsapp_number: string;
  telegram_username: string;
  status_approval?: string;
  payment_proof_image?: string;
  submitted_at?: string;
}

const PendingSubscriptionList = () => {
  const [pendingSubscriptions, setPendingSubscriptions] = useState<PendingSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingSubscriptions();
  }, []);

  // Buscar assinaturas pendentes usando a nova edge function
  const fetchPendingSubscriptions = async () => {
    try {
      setLoading(true);
      
      // Primeiro, tentar usar a edge function para obter as pendentes
      const { data: functionData, error: functionError } = await supabase.functions.invoke('get-pending-subscriptions');
      
      if (functionError) {
        console.error('Erro ao buscar assinaturas pendentes via função:', functionError);
        toast({
          title: 'Erro',
          description: 'Falha ao carregar assinaturas pendentes via função',
          variant: 'destructive',
        });
        
        // Fallback para o método antigo
        fallbackFetchPendingSubscriptions();
        return;
      }
      
      if (functionData && functionData.success && Array.isArray(functionData.data)) {
        console.log(`Encontradas ${functionData.data.length} assinaturas pendentes via função`);
        setPendingSubscriptions(functionData.data);
      } else {
        console.warn('Resposta inesperada da função:', functionData);
        fallbackFetchPendingSubscriptions();
      }
    } catch (error) {
      console.error('Erro ao buscar assinaturas pendentes:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar assinaturas pendentes',
        variant: 'destructive',
      });
      
      // Fallback para o método antigo
      fallbackFetchPendingSubscriptions();
    } finally {
      setLoading(false);
    }
  };

  // Método fallback para buscar assinaturas pendentes diretamente do banco
  const fallbackFetchPendingSubscriptions = async () => {
    try {
      console.log('Usando método fallback para buscar assinaturas pendentes');
      
      // Atualizar registros com status_approval null para 'pending'
      await supabase
        .from('pending_subscriptions')
        .update({ status_approval: 'pending' })
        .is('status_approval', null);
      
      // Buscar assinaturas pendentes
      const { data, error } = await supabase
        .from('pending_subscriptions')
        .select('*')
        .eq('status_approval', 'pending')
        .order('submitted_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      console.log(`Encontradas ${data?.length || 0} assinaturas pendentes via fallback`);
      setPendingSubscriptions(data || []);
    } catch (error) {
      console.error('Erro no fallback para buscar assinaturas pendentes:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar assinaturas pendentes (fallback)',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Formatar data de envio
  const formatSubmittedDate = (dateString?: string) => {
    if (!dateString) return 'Data desconhecida';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch (error) {
      return 'Data inválida';
    }
  };

  // Aprovar assinatura
  const handleApproveSubscription = async (id: string) => {
    try {
      setActionInProgress(id);

      // Buscar a assinatura pendente
      const { data: subscription, error: fetchError } = await supabase
        .from('pending_subscriptions')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      if (!subscription) {
        throw new Error('Assinatura não encontrada');
      }

      // Inserir na tabela de assinaturas aprovadas
      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert([{
          user_id: subscription.user_id,
          title: subscription.title,
          price: subscription.price,
          payment_method: subscription.payment_method,
          status: subscription.status,
          access: subscription.access,
          header_color: subscription.header_color,
          price_color: subscription.price_color,
          whatsapp_number: subscription.whatsapp_number,
          telegram_username: subscription.telegram_username,
          icon: subscription.icon,
          added_date: format(new Date(), 'dd/MM/yyyy', { locale: ptBR }),
          featured: false,
          code: subscription.code,
          pix_key: subscription.pix_key,
          pix_qr_code: subscription.pix_qr_code,
          payment_proof_image: subscription.payment_proof_image,
          visible: true,
          expiration_date: new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000) // 15 dias
        }]);

      if (insertError) {
        throw insertError;
      }

      // Atualizar a assinatura pendente
      const { error: updateError } = await supabase
        .from('pending_subscriptions')
        .update({
          status_approval: 'approved',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: 'Assinatura aprovada',
        description: 'A assinatura foi aprovada com sucesso',
      });

      // Atualizar lista de assinaturas pendentes
      setPendingSubscriptions(prev => prev.filter(sub => sub.id !== id));
    } catch (error) {
      console.error('Erro ao aprovar assinatura:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao aprovar assinatura',
        variant: 'destructive',
      });
    } finally {
      setActionInProgress(null);
    }
  };

  // Rejeitar assinatura
  const handleRejectSubscription = async (id: string) => {
    try {
      setActionInProgress(id);

      const reason = prompt('Motivo da rejeição:');
      
      if (reason === null) {
        // Usuário cancelou
        return;
      }

      const { error } = await supabase
        .from('pending_subscriptions')
        .update({
          status_approval: 'rejected',
          rejection_reason: reason || 'Não especificado',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: 'Assinatura rejeitada',
        description: 'A assinatura foi rejeitada com sucesso',
      });

      // Atualizar lista de assinaturas pendentes
      setPendingSubscriptions(prev => prev.filter(sub => sub.id !== id));
    } catch (error) {
      console.error('Erro ao rejeitar assinatura:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao rejeitar assinatura',
        variant: 'destructive',
      });
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Carregando assinaturas pendentes...</span>
        </div>
      ) : pendingSubscriptions.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Não há assinaturas pendentes para aprovação.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingSubscriptions.map((subscription) => (
            <Card key={subscription.id} className="overflow-hidden">
              <div className="p-4">
                <h3 className="font-bold text-lg">{subscription.title}</h3>
                <p className="text-sm text-gray-600">Preço: {subscription.price}</p>
                <p className="text-sm text-gray-600">Método: {subscription.payment_method}</p>
                <p className="text-sm text-gray-600">WhatsApp: {subscription.whatsapp_number}</p>
                <p className="text-sm text-gray-600">Telegram: {subscription.telegram_username}</p>
                <p className="text-sm text-gray-600">
                  Enviado em: {formatSubmittedDate(subscription.submitted_at)}
                </p>
                
                {subscription.payment_proof_image && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-1">Comprovante de pagamento:</p>
                    <a 
                      href={subscription.payment_proof_image} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-sm hover:text-blue-800"
                    >
                      Ver comprovante
                    </a>
                  </div>
                )}
                
                <div className="flex mt-4 space-x-2">
                  <Button
                    variant="default"
                    className="flex-1"
                    disabled={!!actionInProgress}
                    onClick={() => handleApproveSubscription(subscription.id)}
                  >
                    {actionInProgress === subscription.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Aprovar
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="destructive"
                    className="flex-1"
                    disabled={!!actionInProgress}
                    onClick={() => handleRejectSubscription(subscription.id)}
                  >
                    {actionInProgress === subscription.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-1" />
                        Rejeitar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingSubscriptionList;
