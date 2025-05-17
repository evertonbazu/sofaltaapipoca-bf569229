
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash, Eye, EyeOff, Check, X } from 'lucide-react';
import { 
  getAllSubscriptions, 
  deleteSubscription, 
  toggleVisibilityStatus 
} from '@/services/subscription-service';
import { SubscriptionData } from '@/types/subscriptionTypes';
import { formatDate } from '@/utils/exportUtils';

const PendingSubscriptionList = () => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Carrega assinaturas não aprovadas (visible = false)
  useEffect(() => {
    const loadSubscriptions = async () => {
      try {
        setLoading(true);
        const allSubscriptions = await getAllSubscriptions();
        // Filtra apenas as assinaturas não aprovadas (visible = false)
        const pendingSubscriptions = allSubscriptions.filter(sub => sub.visible === false);
        // Ordena por data de adição (do mais recente para o mais antigo)
        pendingSubscriptions.sort((a, b) => {
          const dateA = a.addedDate ? new Date(a.addedDate).getTime() : 0;
          const dateB = b.addedDate ? new Date(b.addedDate).getTime() : 0;
          return dateB - dateA;
        });
        setSubscriptions(pendingSubscriptions);
      } catch (error) {
        console.error('Erro ao carregar assinaturas pendentes:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as assinaturas pendentes.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadSubscriptions();
  }, [toast]);

  // Função para aprovar uma assinatura
  const handleToggleVisibility = async (id: string, currentStatus: boolean) => {
    try {
      await toggleVisibilityStatus(id, !currentStatus);
      // Atualiza o estado local após a alteração no banco de dados
      setSubscriptions(prev => prev.filter(sub => sub.id !== id));
      
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
    }
  };

  // Função para deletar uma assinatura
  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta assinatura?')) {
      try {
        await deleteSubscription(id);
        setSubscriptions(prev => prev.filter(sub => sub.id !== id));
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
      }
    }
  };

  // Função para formatar URL do Telegram
  const formatTelegramUrl = (username: string) => {
    if (!username) return '';
    const formattedUsername = username.startsWith('@') ? username.substring(1) : username;
    return `https://t.me/${formattedUsername}`;
  };

  // Função para formatar URL do WhatsApp
  const formatWhatsAppUrl = (number: string) => {
    if (!number) return '';
    // Remove caracteres não numéricos
    const cleanNumber = number.replace(/\D/g, '');
    return `https://wa.me/${cleanNumber}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
          <div className="h-10 w-full bg-gray-200 rounded"></div>
          <div className="h-10 w-full bg-gray-200 rounded"></div>
          <div className="h-10 w-full bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium">Nenhuma assinatura pendente encontrada</h3>
        <p className="text-sm text-gray-500">Todas as assinaturas foram aprovadas.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Método de Pagamento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>WhatsApp</TableHead>
            <TableHead>Telegram</TableHead>
            <TableHead>Adicionado em</TableHead>
            <TableHead>Aprovado?</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((subscription) => (
            <TableRow key={subscription.id}>
              <TableCell className="font-medium">{subscription.title}</TableCell>
              <TableCell>{subscription.price}</TableCell>
              <TableCell>{subscription.paymentMethod}</TableCell>
              <TableCell>{subscription.status}</TableCell>
              <TableCell>
                {subscription.whatsappNumber && (
                  <a 
                    href={formatWhatsAppUrl(subscription.whatsappNumber)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {subscription.whatsappNumber}
                  </a>
                )}
              </TableCell>
              <TableCell>
                {subscription.telegramUsername && (
                  <a 
                    href={formatTelegramUrl(subscription.telegramUsername)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {subscription.telegramUsername}
                  </a>
                )}
              </TableCell>
              <TableCell>
                {subscription.addedDate ? formatDate(subscription.addedDate) : 'N/A'}
              </TableCell>
              <TableCell>
                <Badge variant={subscription.visible ? "default" : "destructive"}>
                  {subscription.visible ? 'Sim' : 'Não'}
                </Badge>
              </TableCell>
              <TableCell className="space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate(`/admin/subscriptions/edit/${subscription.id}`)}
                >
                  <Edit className="h-4 w-4 mr-1" /> Editar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDelete(subscription.id!)}
                >
                  <Trash className="h-4 w-4 mr-1" /> Excluir
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleToggleVisibility(subscription.id!, subscription.visible || false)}
                >
                  {subscription.visible ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-1" /> Ocultar
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-1" /> Mostrar
                    </>
                  )}
                </Button>
                <Button 
                  variant={subscription.visible ? "outline" : "default"}
                  size="sm" 
                  onClick={() => handleToggleVisibility(subscription.id!, subscription.visible || false)}
                >
                  {subscription.visible ? (
                    <>
                      <X className="h-4 w-4 mr-1" /> Reprovar
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1" /> Aprovar
                    </>
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PendingSubscriptionList;
