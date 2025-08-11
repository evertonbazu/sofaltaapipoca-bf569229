
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Eye, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface PendingSubscription {
  id: string;
  title: string;
  custom_title?: string;
  price: string;
  payment_method: string;
  status: string;
  access: string;
  whatsapp_number: string;
  telegram_username: string;
  pix_key?: string;
  category?: string;
  created_at: string;
  user_id?: string;
}

/**
 * Página para gerenciar assinaturas pendentes de aprovação
 * @version 3.12.0 - Envio de e-mail ao aprovar anúncio
 */
const PendingSubscriptions = () => {
  const [pendingSubscriptions, setPendingSubscriptions] = useState<PendingSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Carregar assinaturas pendentes
  const loadPendingSubscriptions = async () => {
    try {
      setIsLoading(true);
      console.log('Carregando assinaturas pendentes...');
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('visible', false)
        .not('user_id', 'is', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar assinaturas pendentes:', error);
        throw error;
      }

      console.log('Assinaturas pendentes carregadas:', data?.length || 0);
      setPendingSubscriptions(data || []);
    } catch (error) {
      console.error('Erro ao carregar assinaturas pendentes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as assinaturas pendentes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPendingSubscriptions();
  }, [refreshKey]);

  // Aprovar assinatura
  const approveSubscription = async (id: string) => {
    try {
      console.log('Aprovando assinatura:', id);
      
      const { error } = await supabase
        .from('subscriptions')
        .update({ visible: true })
        .eq('id', id);

      if (error) throw error;

      // Enviar notificação por e-mail (aprovado)
      try {
        console.log('Disparando notificação de aprovação por e-mail (pendentes):', id);
        await supabase.functions.invoke('notify-subscription-event', {
          body: { eventType: 'approved', subscriptionId: id }
        });
      } catch (emailError) {
        console.error('Erro ao enviar notificação por e-mail (pendentes/aprovado):', emailError);
      }

      toast({
        title: "Assinatura aprovada",
        description: "A assinatura foi aprovada e já está visível no site.",
      });

      // Atualizar lista
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Erro ao aprovar assinatura:', error);
      toast({
        title: "Erro",
        description: "Não foi possível aprovar a assinatura.",
        variant: "destructive",
      });
    }
  };

  // Rejeitar assinatura
  const rejectSubscription = async (id: string) => {
    try {
      console.log('Rejeitando assinatura:', id);
      
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Assinatura rejeitada",
        description: "A assinatura foi rejeitada e removida do sistema.",
      });

      // Atualizar lista
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Erro ao rejeitar assinatura:', error);
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar a assinatura.",
        variant: "destructive",
      });
    }
  };

  // Visualizar detalhes da assinatura
  const viewSubscription = (id: string) => {
    navigate(`/admin/subscriptions/edit/${id}`);
  };

  return (
    <AdminLayout title="Assinaturas Pendentes">
      <div className="mb-4">
        <h2 className="text-lg font-medium">Lista de Assinaturas Pendentes</h2>
        <p className="text-sm text-gray-500">
          Visualize e aprove as assinaturas pendentes de aprovação. Depois de aprovadas, elas serão enviadas automaticamente para o grupo do Telegram.
        </p>
        <Button 
          variant="outline" 
          onClick={() => setRefreshKey(prev => prev + 1)}
          className="mt-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Carregando...
            </>
          ) : (
            'Atualizar Lista'
          )}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Carregando assinaturas pendentes...</span>
        </div>
      ) : pendingSubscriptions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-medium mb-2">Nenhuma assinatura pendente</h3>
              <p>Todas as assinaturas foram revisadas!</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingSubscriptions.map((subscription) => (
            <Card key={subscription.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {subscription.custom_title || subscription.title}
                  </CardTitle>
                  <Badge variant="secondary">Pendente</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Preço</label>
                    <p className="text-sm">{subscription.price}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Método de Pagamento</label>
                    <p className="text-sm">{subscription.payment_method}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <p className="text-sm">{subscription.status}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tipo de Acesso</label>
                    <p className="text-sm">{subscription.access}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">WhatsApp</label>
                    <p className="text-sm">{subscription.whatsapp_number}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Telegram</label>
                    <p className="text-sm">{subscription.telegram_username}</p>
                  </div>
                  {subscription.pix_key && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Chave PIX</label>
                      <p className="text-sm">{subscription.pix_key}</p>
                    </div>
                  )}
                  {subscription.category && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Categoria</label>
                      <p className="text-sm">{subscription.category}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Data de Envio</label>
                    <p className="text-sm">
                      {new Date(subscription.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewSubscription(subscription.id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => rejectSubscription(subscription.id)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeitar
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => approveSubscription(subscription.id)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aprovar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default PendingSubscriptions;
