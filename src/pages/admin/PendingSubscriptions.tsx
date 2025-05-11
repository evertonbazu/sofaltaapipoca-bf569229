
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PendingSubscriptionData } from '@/types/subscriptionTypes';
import { addSubscription, logError } from '@/services/subscription-service';

const PendingSubscriptions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(true);
  const [pendingSubscriptions, setPendingSubscriptions] = React.useState<PendingSubscriptionData[]>([]);
  const [rejectedSubscriptions, setRejectedSubscriptions] = React.useState<PendingSubscriptionData[]>([]);
  const [approvedSubscriptions, setApprovedSubscriptions] = React.useState<PendingSubscriptionData[]>([]);
  const [actionInProgress, setActionInProgress] = React.useState<string | null>(null);

  // Buscar assinaturas pendentes
  React.useEffect(() => {
    const fetchPendingSubscriptions = async () => {
      try {
        setIsLoading(true);

        // Buscar assinaturas pendentes
        const { data: pendingData, error: pendingError } = await supabase
          .from('pending_subscriptions')
          .select('*')
          .eq('status_approval', 'pending')
          .order('submitted_at', { ascending: false });
        
        if (pendingError) throw pendingError;
        setPendingSubscriptions(pendingData as PendingSubscriptionData[]);

        // Buscar assinaturas rejeitadas
        const { data: rejectedData, error: rejectedError } = await supabase
          .from('pending_subscriptions')
          .select('*')
          .eq('status_approval', 'rejected')
          .order('reviewed_at', { ascending: false });
        
        if (rejectedError) throw rejectedError;
        setRejectedSubscriptions(rejectedData as PendingSubscriptionData[]);

        // Buscar assinaturas aprovadas
        const { data: approvedData, error: approvedError } = await supabase
          .from('pending_subscriptions')
          .select('*')
          .eq('status_approval', 'approved')
          .order('reviewed_at', { ascending: false });
        
        if (approvedError) throw approvedError;
        setApprovedSubscriptions(approvedData as PendingSubscriptionData[]);

      } catch (error) {
        console.error('Erro ao buscar assinaturas pendentes:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as assinaturas pendentes.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingSubscriptions();
  }, [toast]);

  // Função para aprovar uma assinatura
  const handleApprove = async (subscription: PendingSubscriptionData) => {
    try {
      setActionInProgress(subscription.id || '');

      // Atualizar o status da assinatura pendente
      const { error: updateError } = await supabase
        .from('pending_subscriptions')
        .update({
          status_approval: 'approved',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', subscription.id);
      
      if (updateError) throw updateError;

      // Adicionar à tabela de assinaturas aprovadas
      await addSubscription({
        title: subscription.title,
        price: subscription.price,
        paymentMethod: subscription.paymentMethod,
        status: subscription.status,
        access: subscription.access,
        headerColor: subscription.headerColor || 'bg-blue-600',
        priceColor: subscription.priceColor || 'text-blue-600',
        whatsappNumber: subscription.whatsappNumber,
        telegramUsername: subscription.telegramUsername,
        icon: subscription.icon || '',
        addedDate: subscription.addedDate || new Date().toLocaleDateString('pt-BR'),
        code: subscription.code
      });

      // Atualizar listas
      setPendingSubscriptions(prev => prev.filter(item => item.id !== subscription.id));
      setApprovedSubscriptions(prev => [{ ...subscription, status_approval: 'approved', reviewed_at: new Date().toISOString() }, ...prev]);

      toast({
        title: "Assinatura aprovada",
        description: "A assinatura foi aprovada com sucesso.",
      });

    } catch (error) {
      console.error('Erro ao aprovar assinatura:', error);
      toast({
        title: "Erro",
        description: "Não foi possível aprovar a assinatura.",
        variant: "destructive",
      });
      logError(
        'Erro ao aprovar assinatura pendente',
        JSON.stringify(subscription),
        'APPROVE_ERROR',
        JSON.stringify(error)
      );
    } finally {
      setActionInProgress(null);
    }
  };

  // Função para rejeitar uma assinatura
  const handleReject = async (subscription: PendingSubscriptionData, rejectionReason: string = "Não atende aos critérios") => {
    try {
      setActionInProgress(subscription.id || '');

      // Atualizar o status da assinatura pendente
      const { error: updateError } = await supabase
        .from('pending_subscriptions')
        .update({
          status_approval: 'rejected',
          rejection_reason: rejectionReason,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', subscription.id);
      
      if (updateError) throw updateError;

      // Atualizar listas
      setPendingSubscriptions(prev => prev.filter(item => item.id !== subscription.id));
      setRejectedSubscriptions(prev => [
        { 
          ...subscription, 
          status_approval: 'rejected', 
          rejection_reason: rejectionReason, 
          reviewed_at: new Date().toISOString() 
        }, 
        ...prev
      ]);

      toast({
        title: "Assinatura rejeitada",
        description: "A assinatura foi rejeitada com sucesso.",
      });

    } catch (error) {
      console.error('Erro ao rejeitar assinatura:', error);
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar a assinatura.",
        variant: "destructive",
      });
      logError(
        'Erro ao rejeitar assinatura pendente',
        JSON.stringify(subscription),
        'REJECT_ERROR',
        JSON.stringify(error)
      );
    } finally {
      setActionInProgress(null);
    }
  };

  // Função para excluir uma assinatura pendente
  const handleDelete = async (subscription: PendingSubscriptionData) => {
    try {
      setActionInProgress(subscription.id || '');

      // Excluir a assinatura pendente
      const { error: deleteError } = await supabase
        .from('pending_subscriptions')
        .delete()
        .eq('id', subscription.id);
      
      if (deleteError) throw deleteError;

      // Atualizar listas
      setPendingSubscriptions(prev => prev.filter(item => item.id !== subscription.id));
      setRejectedSubscriptions(prev => prev.filter(item => item.id !== subscription.id));
      setApprovedSubscriptions(prev => prev.filter(item => item.id !== subscription.id));

      toast({
        title: "Assinatura excluída",
        description: "A assinatura foi excluída com sucesso.",
      });

    } catch (error) {
      console.error('Erro ao excluir assinatura:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a assinatura.",
        variant: "destructive",
      });
      logError(
        'Erro ao excluir assinatura pendente',
        JSON.stringify(subscription),
        'DELETE_ERROR',
        JSON.stringify(error)
      );
    } finally {
      setActionInProgress(null);
    }
  };

  // Renderização de cada item de assinatura
  const renderSubscriptionItem = (subscription: PendingSubscriptionData) => {
    const isProcessing = actionInProgress === subscription.id;

    return (
      <Card key={subscription.id} className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex justify-between items-center">
            {subscription.title}
            <Badge variant={
              subscription.status_approval === 'approved' ? 'outline' : 
              subscription.status_approval === 'rejected' ? 'destructive' : 'default'
            }>
              {subscription.status_approval === 'approved' ? 'Aprovado' : 
               subscription.status_approval === 'rejected' ? 'Rejeitado' : 'Pendente'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Preço: {subscription.price} - {subscription.paymentMethod}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Status:</strong> {subscription.status}</p>
            <p><strong>Envio:</strong> {subscription.access}</p>
            <p><strong>Telegram:</strong> {subscription.telegramUsername}</p>
            <p><strong>WhatsApp:</strong> {subscription.whatsappNumber}</p>
            {subscription.addedDate && <p><strong>Data Adicionada:</strong> {subscription.addedDate}</p>}
            {subscription.submitted_at && (
              <p>
                <strong>Enviado em:</strong> {new Date(subscription.submitted_at).toLocaleString('pt-BR')}
              </p>
            )}
            {subscription.status_approval === 'rejected' && subscription.rejection_reason && (
              <p className="text-red-600"><strong>Motivo da rejeição:</strong> {subscription.rejection_reason}</p>
            )}
          </div>

          {/* Botões de ação */}
          <div className="flex gap-2 mt-4">
            {subscription.status_approval === 'pending' && (
              <>
                <Button 
                  onClick={() => handleApprove(subscription)} 
                  disabled={isProcessing}
                  size="sm"
                  className="flex-1"
                >
                  {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                  Aprovar
                </Button>
                <Button 
                  onClick={() => handleReject(subscription)} 
                  variant="destructive" 
                  disabled={isProcessing}
                  size="sm"
                  className="flex-1"
                >
                  {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />}
                  Rejeitar
                </Button>
              </>
            )}
            <Button 
              onClick={() => handleDelete(subscription)} 
              variant="outline" 
              disabled={isProcessing}
              size="sm"
              className="flex-1"
            >
              Excluir
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <AdminLayout title="Assinaturas Pendentes">
      <div className="mb-4">
        <h2 className="text-lg font-medium">Gerenciar Solicitações de Assinatura</h2>
        <p className="text-sm text-gray-500">
          Revise, aprove ou rejeite solicitações de assinatura enviadas pelos usuários
        </p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            Pendentes ({pendingSubscriptions.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Aprovadas ({approvedSubscriptions.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejeitadas ({rejectedSubscriptions.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="mt-4">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              <span>Carregando solicitações pendentes...</span>
            </div>
          ) : pendingSubscriptions.length > 0 ? (
            pendingSubscriptions.map(renderSubscriptionItem)
          ) : (
            <p className="text-center py-8 text-gray-500">Não há solicitações pendentes.</p>
          )}
        </TabsContent>
        
        <TabsContent value="approved" className="mt-4">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              <span>Carregando solicitações aprovadas...</span>
            </div>
          ) : approvedSubscriptions.length > 0 ? (
            approvedSubscriptions.map(renderSubscriptionItem)
          ) : (
            <p className="text-center py-8 text-gray-500">Não há solicitações aprovadas.</p>
          )}
        </TabsContent>
        
        <TabsContent value="rejected" className="mt-4">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              <span>Carregando solicitações rejeitadas...</span>
            </div>
          ) : rejectedSubscriptions.length > 0 ? (
            rejectedSubscriptions.map(renderSubscriptionItem)
          ) : (
            <p className="text-center py-8 text-gray-500">Não há solicitações rejeitadas.</p>
          )}
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default PendingSubscriptions;
