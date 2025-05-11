
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Loader2, Check, X, Edit, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PendingSubscriptionData } from '@/types/subscriptionTypes';
import { addSubscription, logError } from '@/services/subscription-service';

const PendingSubscriptions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [pendingSubscriptions, setPendingSubscriptions] = useState<PendingSubscriptionData[]>([]);
  const [rejectedSubscriptions, setRejectedSubscriptions] = useState<PendingSubscriptionData[]>([]);
  const [approvedSubscriptions, setApprovedSubscriptions] = useState<PendingSubscriptionData[]>([]);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<PendingSubscriptionData | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch pending subscriptions
  useEffect(() => {
    const fetchPendingSubscriptions = async () => {
      try {
        setIsLoading(true);

        // Fetch pending subscriptions
        const { data: pendingData, error: pendingError } = await supabase
          .from('pending_subscriptions')
          .select('*')
          .eq('status_approval', 'pending')
          .order('submitted_at', { ascending: false });
        
        if (pendingError) throw pendingError;
        
        // Map database response to PendingSubscriptionData format
        const mappedPendingData: PendingSubscriptionData[] = pendingData.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          paymentMethod: item.payment_method,
          status: item.status,
          access: item.access,
          headerColor: item.header_color,
          priceColor: item.price_color,
          whatsappNumber: item.whatsapp_number,
          telegramUsername: item.telegram_username,
          icon: item.icon,
          addedDate: item.added_date,
          code: item.code,
          userId: item.user_id,
          pixKey: item.pix_key,
          paymentProofImage: item.payment_proof_image,
          pixQrCode: item.pix_qr_code,
          statusApproval: item.status_approval,
          rejectionReason: item.rejection_reason,
          submitted_at: item.submitted_at,
          reviewed_at: item.reviewed_at
        }));
        
        setPendingSubscriptions(mappedPendingData);

        // Fetch rejected subscriptions
        const { data: rejectedData, error: rejectedError } = await supabase
          .from('pending_subscriptions')
          .select('*')
          .eq('status_approval', 'rejected')
          .order('reviewed_at', { ascending: false });
        
        if (rejectedError) throw rejectedError;
        
        // Map database response to PendingSubscriptionData format
        const mappedRejectedData: PendingSubscriptionData[] = rejectedData.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          paymentMethod: item.payment_method,
          status: item.status,
          access: item.access,
          headerColor: item.header_color,
          priceColor: item.price_color,
          whatsappNumber: item.whatsapp_number,
          telegramUsername: item.telegram_username,
          icon: item.icon,
          addedDate: item.added_date,
          code: item.code,
          userId: item.user_id,
          pixKey: item.pix_key,
          paymentProofImage: item.payment_proof_image,
          pixQrCode: item.pix_qr_code,
          statusApproval: item.status_approval,
          rejectionReason: item.rejection_reason,
          submitted_at: item.submitted_at,
          reviewed_at: item.reviewed_at
        }));
        
        setRejectedSubscriptions(mappedRejectedData);

        // Fetch approved subscriptions
        const { data: approvedData, error: approvedError } = await supabase
          .from('pending_subscriptions')
          .select('*')
          .eq('status_approval', 'approved')
          .order('reviewed_at', { ascending: false });
        
        if (approvedError) throw approvedError;
        
        // Map database response to PendingSubscriptionData format
        const mappedApprovedData: PendingSubscriptionData[] = approvedData.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          paymentMethod: item.payment_method,
          status: item.status,
          access: item.access,
          headerColor: item.header_color,
          priceColor: item.price_color,
          whatsappNumber: item.whatsapp_number,
          telegramUsername: item.telegram_username,
          icon: item.icon,
          addedDate: item.added_date,
          code: item.code,
          userId: item.user_id,
          pixKey: item.pix_key,
          paymentProofImage: item.payment_proof_image,
          pixQrCode: item.pix_qr_code,
          statusApproval: item.status_approval,
          rejectionReason: item.rejection_reason,
          submitted_at: item.submitted_at,
          reviewed_at: item.reviewed_at
        }));
        
        setApprovedSubscriptions(mappedApprovedData);

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

  // Function to approve a subscription
  const handleApprove = async (subscription: PendingSubscriptionData) => {
    try {
      setActionInProgress(subscription.id || '');

      // Update the status of the pending subscription
      const { error: updateError } = await supabase
        .from('pending_subscriptions')
        .update({
          status_approval: 'approved',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', subscription.id);
      
      if (updateError) throw updateError;

      // Add to approved subscriptions table
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
        code: subscription.code,
        pixKey: subscription.pixKey,
        userId: subscription.userId
      });

      // Update lists
      setPendingSubscriptions(prev => prev.filter(item => item.id !== subscription.id));
      setApprovedSubscriptions(prev => [{ ...subscription, statusApproval: 'approved', reviewed_at: new Date().toISOString() }, ...prev]);

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

  // Open reject dialog
  const openRejectDialog = (subscription: PendingSubscriptionData) => {
    setCurrentSubscription(subscription);
    setRejectionReason('');
    setShowRejectDialog(true);
  };

  // Function to reject a subscription
  const handleReject = async () => {
    if (!currentSubscription) return;
    
    try {
      setActionInProgress(currentSubscription.id || '');

      // Update the status of the pending subscription
      const { error: updateError } = await supabase
        .from('pending_subscriptions')
        .update({
          status_approval: 'rejected',
          rejection_reason: rejectionReason || "Não atende aos critérios",
          reviewed_at: new Date().toISOString()
        })
        .eq('id', currentSubscription.id);
      
      if (updateError) throw updateError;

      // Update lists
      setPendingSubscriptions(prev => prev.filter(item => item.id !== currentSubscription.id));
      setRejectedSubscriptions(prev => [
        { 
          ...currentSubscription, 
          statusApproval: 'rejected', 
          rejectionReason: rejectionReason || "Não atende aos critérios", 
          reviewed_at: new Date().toISOString() 
        }, 
        ...prev
      ]);

      toast({
        title: "Assinatura rejeitada",
        description: "A assinatura foi rejeitada com sucesso.",
      });

      setShowRejectDialog(false);
      setCurrentSubscription(null);
      setRejectionReason('');

    } catch (error) {
      console.error('Erro ao rejeitar assinatura:', error);
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar a assinatura.",
        variant: "destructive",
      });
      logError(
        'Erro ao rejeitar assinatura pendente',
        JSON.stringify(currentSubscription),
        'REJECT_ERROR',
        JSON.stringify(error)
      );
    } finally {
      setActionInProgress(null);
    }
  };

  // Function to edit a pending subscription
  const handleEdit = (subscription: PendingSubscriptionData) => {
    navigate(`/admin/subscriptions/edit/${subscription.id}?source=pending`);
  };

  // Function to delete a pending subscription
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

  // Render each subscription item
  const renderSubscriptionItem = (subscription: PendingSubscriptionData) => {
    const isProcessing = actionInProgress === subscription.id;

    return (
      <Card key={subscription.id} className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex justify-between items-center">
            {subscription.title}
            <Badge variant={
              subscription.statusApproval === 'approved' ? 'outline' : 
              subscription.statusApproval === 'rejected' ? 'destructive' : 'default'
            }>
              {subscription.statusApproval === 'approved' ? 'Aprovado' : 
               subscription.statusApproval === 'rejected' ? 'Rejeitado' : 'Pendente'}
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
            {subscription.pixKey && <p><strong>Chave PIX:</strong> {subscription.pixKey}</p>}
            {subscription.addedDate && <p><strong>Data Adicionada:</strong> {subscription.addedDate}</p>}
            {subscription.code && <p><strong>Código:</strong> {subscription.code}</p>}
            {subscription.submitted_at && (
              <p>
                <strong>Enviado em:</strong> {new Date(subscription.submitted_at).toLocaleString('pt-BR')}
              </p>
            )}
            {subscription.statusApproval === 'rejected' && subscription.rejectionReason && (
              <p className="text-red-600"><strong>Motivo da rejeição:</strong> {subscription.rejectionReason}</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            {subscription.statusApproval === 'pending' && (
              <>
                <Button 
                  onClick={() => handleApprove(subscription)} 
                  disabled={isProcessing}
                  size="sm"
                  className="flex-1"
                  variant="default"
                >
                  {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                  Aprovar
                </Button>
                <Button 
                  onClick={() => openRejectDialog(subscription)} 
                  variant="destructive" 
                  disabled={isProcessing}
                  size="sm"
                  className="flex-1"
                >
                  {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />}
                  Rejeitar
                </Button>
                <Button 
                  onClick={() => handleEdit(subscription)} 
                  variant="outline" 
                  disabled={isProcessing}
                  size="sm"
                  className="flex-1"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
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
              <Trash className="mr-2 h-4 w-4" />
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
          Revise, aprove, edite ou rejeite solicitações de assinatura enviadas pelos usuários
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

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rejeitar Assinatura</AlertDialogTitle>
            <AlertDialogDescription>
              Informe o motivo da rejeição desta assinatura. Esta informação será visível para o usuário.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <Input 
              placeholder="Motivo da rejeição"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full"
            />
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowRejectDialog(false);
              setCurrentSubscription(null);
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleReject}>
              {actionInProgress === (currentSubscription?.id || '') ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Confirmar Rejeição
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default PendingSubscriptions;
