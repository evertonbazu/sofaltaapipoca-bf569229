
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Pencil, 
  Trash2, 
  Star, 
  StarOff, 
  Search, 
  Info 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { SubscriptionData } from '@/types/subscriptionTypes';
import { deleteSubscription, getAllSubscriptions, toggleFeaturedStatus } from '@/services/subscription-service';

const SubscriptionList = () => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<SubscriptionData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Buscar assinaturas quando o componente montar
  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // Filtrar assinaturas com base no termo de busca
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSubscriptions(subscriptions);
    } else {
      const lowercaseSearchTerm = searchTerm.toLowerCase();
      const filtered = subscriptions.filter((subscription) => {
        return (
          subscription.title.toLowerCase().includes(lowercaseSearchTerm) ||
          subscription.price.toLowerCase().includes(lowercaseSearchTerm) ||
          subscription.status.toLowerCase().includes(lowercaseSearchTerm) ||
          subscription.paymentMethod.toLowerCase().includes(lowercaseSearchTerm)
        );
      });
      setFilteredSubscriptions(filtered);
    }
  }, [searchTerm, subscriptions]);

  // Função para buscar assinaturas
  const fetchSubscriptions = async () => {
    setIsLoading(true);
    try {
      const data = await getAllSubscriptions();
      setSubscriptions(data);
      setFilteredSubscriptions(data);
    } catch (error) {
      toast({
        title: "Erro ao carregar assinaturas",
        description: "Não foi possível carregar a lista de assinaturas.",
        variant: "destructive",
      });
      console.error('Erro ao buscar assinaturas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Abrir diálogo de confirmação para excluir
  const handleDeleteClick = (id: string) => {
    setSubscriptionToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Excluir assinatura
  const handleDeleteConfirm = async () => {
    if (!subscriptionToDelete) return;
    
    try {
      await deleteSubscription(subscriptionToDelete);
      
      toast({
        title: "Assinatura excluída",
        description: "A assinatura foi excluída com sucesso.",
      });
      
      // Atualizar lista após exclusão
      fetchSubscriptions();
    } catch (error) {
      toast({
        title: "Erro ao excluir assinatura",
        description: "Não foi possível excluir a assinatura.",
        variant: "destructive",
      });
      console.error('Erro ao excluir assinatura:', error);
    } finally {
      setDeleteDialogOpen(false);
      setSubscriptionToDelete(null);
    }
  };

  // Alternar status de destaque
  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      await toggleFeaturedStatus(id, !currentStatus);
      
      toast({
        title: currentStatus ? "Destaque removido" : "Assinatura destacada",
        description: currentStatus 
          ? "A assinatura não está mais em destaque." 
          : "A assinatura foi colocada em destaque.",
      });
      
      // Atualizar lista após alteração
      fetchSubscriptions();
    } catch (error) {
      toast({
        title: "Erro ao alterar destaque",
        description: "Não foi possível alterar o status de destaque.",
        variant: "destructive",
      });
      console.error('Erro ao alternar destaque:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra de pesquisa */}
      <div className="flex items-center border rounded-md bg-white p-2">
        <Search className="h-5 w-5 text-gray-400 mr-2" />
        <Input
          type="text"
          placeholder="Buscar assinaturas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-0 focus-visible:ring-0 focus-visible:ring-transparent"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8">Carregando assinaturas...</div>
      ) : filteredSubscriptions.length > 0 ? (
        <div className="bg-white rounded-md shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden md:table-cell">Pagamento</TableHead>
                <TableHead className="hidden md:table-cell">Destaque</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell className="font-medium">{subscription.title}</TableCell>
                  <TableCell>{subscription.price}</TableCell>
                  <TableCell className="hidden md:table-cell">{subscription.status}</TableCell>
                  <TableCell className="hidden md:table-cell">{subscription.paymentMethod}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {subscription.featured ? 'Sim' : 'Não'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleToggleFeatured(subscription.id!, subscription.featured || false)}
                        title={subscription.featured ? "Remover destaque" : "Destacar"}
                      >
                        {subscription.featured ? (
                          <StarOff className="h-4 w-4" />
                        ) : (
                          <Star className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate(`/admin/subscriptions/edit/${subscription.id}`)}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteClick(subscription.id!)}
                        className="text-red-500 hover:text-red-700"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="bg-white rounded-md shadow p-8 text-center">
          <Info className="h-12 w-12 mx-auto text-gray-400 mb-2" />
          <h3 className="text-lg font-medium">Nenhuma assinatura encontrada</h3>
          <p className="text-gray-500 mt-1">
            {searchTerm 
              ? "Não foram encontradas assinaturas com esse termo de busca." 
              : "Não há assinaturas cadastradas ainda."}
          </p>
          {searchTerm && (
            <Button 
              variant="link" 
              onClick={() => setSearchTerm('')}
              className="mt-2"
            >
              Limpar busca
            </Button>
          )}
        </div>
      )}

      {/* Diálogo de confirmação para exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A assinatura será permanentemente excluída.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SubscriptionList;
