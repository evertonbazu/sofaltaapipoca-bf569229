import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  X, 
  Trash2, 
  Eye, 
  EyeOff, 
  Star, 
  Clock, 
  Download, 
  MessageCircle // Alterado de Telegram para MessageCircle
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { SubscriptionData } from '@/types/subscriptionTypes';
import { deleteSubscription, getAllSubscriptions, toggleVisibilityStatus } from '@/services/subscription-service';
import { downloadSubscriptionAsTxt } from '@/utils/exportUtils';
import { supabase } from '@/integrations/supabase/client';
import { sendToTelegramGroup, isAutoPostingEnabled } from '@/utils/shareUtils';

const PendingSubscriptionList = () => {
  const [pendingSubscriptions, setPendingSubscriptions] = useState<SubscriptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionData | null>(null);
  const [telegramPosting, setTelegramPosting] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'N/A';
    
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('pt-BR', { 
        day: '2-digit', 
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return dateStr;
    }
  };

  const fetchPendingSubscriptions = async () => {
    setLoading(true);
    try {
      console.log('Buscando assinaturas pendentes...');
      
      // Corrigindo a consulta para selecionar apenas assinaturas com status_approval = 'pending'
      const { data, error } = await supabase
        .from('pending_subscriptions')
        .select('*')
        .eq('status_approval', 'pending') // Filtro adicionado para garantir que apenas assinaturas pendentes sejam mostradas
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar assinaturas pendentes:', error);
        throw error;
      }

      console.log('Assinaturas pendentes encontradas:', data?.length || 0);

      // Map the database column names to our frontend property names
      const mappedData = data.map((item: any) => ({
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
        addedDate: item.added_date || formatDate(item.submitted_at),
        // Correção: renomear para submitted_at para corresponder ao tipo SubscriptionData
        submitted_at: item.submitted_at, 
        statusApproval: item.status_approval,
        userId: item.user_id,
        code: item.code,
        pixKey: item.pix_key,
        paymentProofImage: item.payment_proof_image,
        isMemberSubmission: !!item.user_id,
        rejectionReason: item.rejection_reason,
        piqQrCode: item.pix_qr_code,
        visible: item.visible
      }));

      setPendingSubscriptions(mappedData);
    } catch (error) {
      console.error('Error fetching pending subscriptions:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as assinaturas pendentes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingSubscriptions();
  }, []);

  const handleApproveSubscription = async (subscription: SubscriptionData) => {
    try {
      // Primeiro insere na tabela de assinaturas
      const { data: newSubscription, error: insertError } = await supabase
        .from('subscriptions')
        .insert({
          title: subscription.title,
          price: subscription.price,
          payment_method: subscription.paymentMethod,
          status: subscription.status,
          access: subscription.access,
          header_color: subscription.headerColor || 'bg-blue-600',
          price_color: subscription.priceColor || 'text-blue-600',
          whatsapp_number: subscription.whatsappNumber,
          telegram_username: subscription.telegramUsername,
          icon: subscription.icon,
          added_date: subscription.addedDate,
          code: subscription.code,
          pix_key: subscription.pixKey,
          user_id: subscription.userId,
          payment_proof_image: subscription.paymentProofImage,
          visible: true
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      // Depois atualiza o status na tabela de pending_subscriptions
      const { error: updateError } = await supabase
        .from('pending_subscriptions')
        .update({ 
          status_approval: 'approved',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', subscription.id);
      
      if (updateError) throw updateError;
      
      toast({
        title: "Assinatura aprovada",
        description: "A assinatura foi aprovada e adicionada à lista de assinaturas.",
      });
      
      // Enviar a assinatura aprovada para o Telegram
      setTelegramPosting(prev => ({ ...prev, [subscription.id!]: true }));
      
      try {
        // Verificar se o envio automático está ativado
        const autoTelegramEnabled = await isAutoPostingEnabled();
        
        if (autoTelegramEnabled && newSubscription) {
          // Enviar assinatura para o grupo do Telegram
          console.log('Enviando assinatura aprovada para o Telegram:', newSubscription.id);
          const telegramResult = await sendToTelegramGroup(newSubscription.id);
          
          if (telegramResult.success) {
            toast({
              title: "Assinatura enviada",
              description: "A assinatura foi enviada para o grupo do Telegram.",
            });
          } else {
            toast({
              title: "Assinatura aprovada",
              description: "A assinatura foi aprovada, mas pode haver um problema ao enviar para o Telegram: " + 
                         (telegramResult.error || "Erro desconhecido"),
              variant: "destructive", // Changed from "warning" to "destructive"
            });
          }
        }
      } catch (telegramError) {
        console.error('Erro ao enviar para o Telegram:', telegramError);
        toast({
          title: "Erro no Telegram",
          description: "A assinatura foi aprovada, mas ocorreu um erro ao enviar para o Telegram.",
          variant: "destructive",
        });
      } finally {
        setTelegramPosting(prev => ({ ...prev, [subscription.id!]: false }));
      }
      
      // Recarregar a lista
      fetchPendingSubscriptions();
    } catch (error) {
      console.error('Error approving subscription:', error);
      toast({
        title: "Erro",
        description: "Não foi possível aprovar a assinatura.",
        variant: "destructive",
      });
    }
  };

  const handleRejectSubscription = async (subscription: SubscriptionData) => {
    try {
      // Atualiza o status na tabela de pending_subscriptions
      const { error: updateError } = await supabase
        .from('pending_subscriptions')
        .update({ 
          status_approval: 'rejected',
          reviewed_at: new Date().toISOString(),
          // Poderia adicionar um campo para o motivo da rejeição
        })
        .eq('id', subscription.id);
      
      if (updateError) throw updateError;
      
      toast({
        title: "Assinatura rejeitada",
        description: "A assinatura foi marcada como rejeitada.",
      });
      
      // Recarregar a lista
      fetchPendingSubscriptions();
    } catch (error) {
      console.error('Error rejecting subscription:', error);
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar a assinatura.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (subscription: SubscriptionData) => {
    setSelectedSubscription(subscription);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSubscription?.id) return;
    
    try {
      const { error } = await supabase
        .from('pending_subscriptions')
        .delete()
        .eq('id', selectedSubscription.id);
      
      if (error) throw error;
      
      toast({
        title: "Assinatura excluída",
        description: "A assinatura pendente foi excluída com sucesso.",
      });
      
      // Recarregar a lista
      fetchPendingSubscriptions();
    } catch (error) {
      console.error('Error deleting subscription:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a assinatura.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedSubscription(null);
    }
  };

  const handleExportClick = (subscription: SubscriptionData) => {
    downloadSubscriptionAsTxt(subscription);
    toast({
      title: "Assinatura exportada",
      description: "A assinatura foi exportada como arquivo de texto.",
    });
  };

  const getRowClass = (statusApproval: string | undefined) => {
    switch(statusApproval) {
      case 'approved': return 'bg-green-50';
      case 'rejected': return 'bg-red-50';
      default: return '';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center p-8">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      <span className="ml-2">Carregando assinaturas pendentes...</span>
    </div>;
  }

  if (pendingSubscriptions.length === 0) {
    return <div className="bg-muted/20 p-6 rounded-lg text-center">
      <h3 className="text-lg font-medium">Sem assinaturas pendentes</h3>
      <p className="text-muted-foreground mt-2">Não há assinaturas pendentes de aprovação no momento.</p>
    </div>;
  }

  return (
    <>
      <Table>
        <TableCaption>Lista de assinaturas pendentes de aprovação</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Enviada em</TableHead>
            <TableHead>Status de aprovação</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingSubscriptions.map((subscription) => (
            <TableRow key={subscription.id} className={getRowClass(subscription.statusApproval)}>
              <TableCell className="font-medium">{subscription.title}</TableCell>
              <TableCell>{subscription.price}</TableCell>
              <TableCell>{subscription.status}</TableCell>
              <TableCell>{formatDate(subscription.submitted_at)}</TableCell>
              <TableCell>
                {subscription.statusApproval === 'pending' && <span className="flex items-center"><Clock className="w-4 h-4 mr-1 text-amber-500" /> Pendente</span>}
                {subscription.statusApproval === 'approved' && <span className="flex items-center"><Check className="w-4 h-4 mr-1 text-green-500" /> Aprovada</span>}
                {subscription.statusApproval === 'rejected' && <span className="flex items-center"><X className="w-4 h-4 mr-1 text-red-500" /> Rejeitada</span>}
              </TableCell>
              <TableCell>
                <div className="flex space-x-1">
                  {subscription.statusApproval === 'pending' && (
                    <>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleApproveSubscription(subscription)}
                        title="Aprovar"
                      >
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleRejectSubscription(subscription)}
                        title="Rejeitar"
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </>
                  )}
                  {subscription.statusApproval === 'approved' && (
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => navigate(`/admin/subscriptions`)}
                      title="Ver assinaturas aprovadas"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleExportClick(subscription)}
                    title="Exportar"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {telegramPosting[subscription.id!] ? (
                    <Button 
                      variant="outline" 
                      size="icon" 
                      disabled
                      title="Enviando para o Telegram..."
                    >
                      <span className="animate-spin">⏳</span>
                    </Button>
                  ) : subscription.statusApproval === 'approved' && (
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={async () => {
                        // Buscar o ID da assinatura aprovada
                        const { data } = await supabase
                          .from('subscriptions')
                          .select('id')
                          .eq('title', subscription.title)
                          .maybeSingle();
                          
                        if (data?.id) {
                          setTelegramPosting(prev => ({ ...prev, [subscription.id!]: true }));
                          try {
                            const result = await sendToTelegramGroup(data.id);
                            if (result.success) {
                              toast({
                                title: "Enviado com sucesso",
                                description: "A assinatura foi enviada para o grupo do Telegram.",
                              });
                            } else {
                              toast({
                                title: "Erro ao enviar",
                                description: result.error || "Erro desconhecido ao enviar para o Telegram.",
                                variant: "destructive",
                              });
                            }
                          } catch (error) {
                            toast({
                              title: "Erro",
                              description: "Não foi possível enviar para o Telegram.",
                              variant: "destructive",
                            });
                          } finally {
                            setTelegramPosting(prev => ({ ...prev, [subscription.id!]: false }));
                          }
                        } else {
                          toast({
                            title: "Erro",
                            description: "Não foi possível encontrar a assinatura aprovada.",
                            variant: "destructive",
                          });
                        }
                      }}
                      title="Enviar para o Telegram"
                    >
                      <MessageCircle className="h-4 w-4 text-blue-500" />
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleDeleteClick(subscription)}
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a assinatura pendente "{selectedSubscription?.title}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PendingSubscriptionList;
