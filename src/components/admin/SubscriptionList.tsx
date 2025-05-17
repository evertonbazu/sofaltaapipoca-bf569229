
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Pencil, 
  Trash2, 
  Star, 
  StarOff, 
  Info,
  ArrowUp,
  ArrowDown,
  User,
  FileText,
  Send,
  MessageSquare,
  Eye,
  EyeOff,
  Search
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
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
import { deleteSubscription, getAllSubscriptions, toggleFeaturedStatus, toggleVisibilityStatus } from '@/services/subscription-service';
import { downloadSubscriptionAsTxt } from '@/utils/exportUtils';
import { getWhatsAppShareLink, getTelegramShareLink } from '@/utils/shareUtils';

type SortField = 'title' | 'price' | 'telegramUsername' | 'whatsappNumber' | 'featured' | 'addedDate' | 'visible';
type SortDirection = 'asc' | 'desc';

interface SubscriptionListProps {
  searchTerm?: string;
}

const SubscriptionList: React.FC<SubscriptionListProps> = ({ searchTerm = '' }) => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<SubscriptionData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isMultiDeleteDialogOpen, setIsMultiDeleteDialogOpen] = useState<boolean>(false);
  const [sortField, setSortField] = useState<SortField>('addedDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Buscar assinaturas quando o componente montar
  useEffect(() => {
    fetchSubscriptions();
  }, []);

  // Filtrar assinaturas com base no termo de busca
  useEffect(() => {
    if (!searchTerm || searchTerm.trim() === '') {
      setFilteredSubscriptions(subscriptions);
    } else {
      const lowercaseSearchTerm = searchTerm.toLowerCase();
      const filtered = subscriptions.filter((subscription) => {
        return (
          subscription.title?.toLowerCase().includes(lowercaseSearchTerm) ||
          subscription.price?.toLowerCase().includes(lowercaseSearchTerm) ||
          subscription.telegramUsername?.toLowerCase().includes(lowercaseSearchTerm) ||
          subscription.whatsappNumber?.toLowerCase().includes(lowercaseSearchTerm) ||
          subscription.addedDate?.toLowerCase().includes(lowercaseSearchTerm)
        );
      });
      setFilteredSubscriptions(filtered);
    }
  }, [searchTerm, subscriptions]);

  // Ordenar assinaturas quando o campo ou direção de ordenação mudar
  useEffect(() => {
    if (!sortField) {
      return;
    }
    
    const sorted = [...filteredSubscriptions].sort((a, b) => {
      let valueA: string | boolean = '';
      let valueB: string | boolean = '';
      
      switch (sortField) {
        case 'title':
          valueA = a.title?.toLowerCase() || '';
          valueB = b.title?.toLowerCase() || '';
          break;
        case 'price':
          valueA = a.price?.toLowerCase() || '';
          valueB = b.price?.toLowerCase() || '';
          break;
        case 'telegramUsername':
          valueA = a.telegramUsername?.toLowerCase() || '';
          valueB = b.telegramUsername?.toLowerCase() || '';
          break;
        case 'whatsappNumber':
          valueA = a.whatsappNumber?.toLowerCase() || '';
          valueB = b.whatsappNumber?.toLowerCase() || '';
          break;
        case 'featured':
          valueA = a.featured || false;
          valueB = b.featured || false;
          break;
        case 'visible':
          valueA = a.visible || false;
          valueB = b.visible || false;
          break;
        case 'addedDate':
          // Para datas no formato DD/MM/YYYY, convertemos para YYYY/MM/DD para ordenação
          if (a.addedDate && b.addedDate) {
            const partsA = a.addedDate.split('/');
            const partsB = b.addedDate.split('/');
            if (partsA.length === 3 && partsB.length === 3) {
              valueA = `${partsA[2]}/${partsA[1]}/${partsA[0]}`;
              valueB = `${partsB[2]}/${partsB[1]}/${partsB[0]}`;
            } else {
              valueA = a.addedDate;
              valueB = b.addedDate;
            }
          } else {
            valueA = a.addedDate || '';
            valueB = b.addedDate || '';
          }
          break;
      }
      
      if (typeof valueA === 'boolean' && typeof valueB === 'boolean') {
        return sortDirection === 'asc' ? 
          Number(valueA) - Number(valueB) : 
          Number(valueB) - Number(valueA);
      }
      
      if (sortDirection === 'asc') {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    });
    
    setFilteredSubscriptions(sorted);
  }, [sortField, sortDirection, filteredSubscriptions]);

  // Função para alterar a ordenação ao clicar em um cabeçalho da tabela
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Se já estamos ordenando por este campo, alternar a direção
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Caso contrário, definir o novo campo de ordenação e resetar para ascendente
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Renderizar indicador de ordenação
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return null;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 inline ml-1" />
    );
  };

  // Função para buscar assinaturas
  const fetchSubscriptions = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching subscriptions...');
      const data = await getAllSubscriptions();
      console.log('Subscriptions loaded:', data.length, data);
      
      if (data && data.length > 0) {
        setSubscriptions(data);
        setFilteredSubscriptions(data);
        
        // Forçar ordenação inicial por data (mais recentes primeiro)
        setSortField('addedDate');
        setSortDirection('desc');
      } else {
        console.log('No subscriptions found or data is empty');
        setSubscriptions([]);
        setFilteredSubscriptions([]);
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar assinaturas",
        description: "Não foi possível carregar a lista de assinaturas.",
        variant: "destructive",
      });
      console.error('Erro ao buscar assinaturas:', error);
      setSubscriptions([]);
      setFilteredSubscriptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Gerar link para Telegram
  const getTelegramLink = (username: string) => {
    if (!username) return '#';
    // Remove @ if present at the beginning of the username
    const cleanUsername = username.startsWith('@') ? username.substring(1) : username;
    return `https://telegram.me/${cleanUsername}`;
  };

  // Gerar link para WhatsApp
  const getWhatsappLink = (number: string) => {
    if (!number) return '#';
    return `https://wa.me/${number}`;
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

  // Alternar status de visibilidade
  const handleToggleVisibility = async (id: string, currentStatus: boolean) => {
    try {
      await toggleVisibilityStatus(id, !currentStatus);
      
      toast({
        title: currentStatus ? "Assinatura ocultada" : "Assinatura aprovada",
        description: currentStatus 
          ? "A assinatura não será exibida no site." 
          : "A assinatura será exibida no site.",
      });
      
      // Atualizar lista após alteração
      fetchSubscriptions();
    } catch (error) {
      toast({
        title: "Erro ao alterar visibilidade",
        description: "Não foi possível alterar o status de visibilidade.",
        variant: "destructive",
      });
      console.error('Erro ao alternar visibilidade:', error);
    }
  };

  // Gerenciar seleção de itens
  const toggleItemSelection = (id: string) => {
    const newSelectedItems = new Set(selectedItems);
    if (newSelectedItems.has(id)) {
      newSelectedItems.delete(id);
    } else {
      newSelectedItems.add(id);
    }
    setSelectedItems(newSelectedItems);
  };

  // Selecionar todos os itens
  const selectAll = () => {
    if (selectedItems.size === filteredSubscriptions.length) {
      // Se todos já estão selecionados, desmarcar todos
      setSelectedItems(new Set());
    } else {
      // Senão, selecionar todos
      const allIds = filteredSubscriptions.map(sub => sub.id!);
      setSelectedItems(new Set(allIds));
    }
  };

  // Excluir múltiplos itens
  const handleDeleteMultipleConfirm = async () => {
    try {
      let successCount = 0;
      let errorCount = 0;

      // Converter o Set para um Array para poder usar o Promise.all
      const deletePromises = Array.from(selectedItems).map(async (id) => {
        try {
          await deleteSubscription(id);
          successCount++;
        } catch (error) {
          errorCount++;
          console.error(`Erro ao excluir assinatura ${id}:`, error);
        }
      });

      await Promise.all(deletePromises);
      
      toast({
        title: `${successCount} assinaturas excluídas`,
        description: errorCount > 0 
          ? `${errorCount} assinaturas não foram excluídas devido a erros.` 
          : "Todas as assinaturas selecionadas foram excluídas com sucesso.",
        variant: errorCount > 0 ? "destructive" : "default",
      });
      
      // Limpar seleção e atualizar lista
      setSelectedItems(new Set());
      fetchSubscriptions();
    } catch (error) {
      toast({
        title: "Erro ao excluir assinaturas",
        description: "Ocorreu um erro ao excluir as assinaturas selecionadas.",
        variant: "destructive",
      });
      console.error('Erro ao excluir múltiplas assinaturas:', error);
    } finally {
      setIsMultiDeleteDialogOpen(false);
    }
  };

  console.log('Rendering SubscriptionList with', filteredSubscriptions.length, 'subscriptions');
  console.log('isLoading:', isLoading);

  return (
    <div className="space-y-4">
      {/* Barra de pesquisa e ações em lote */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex items-center border rounded-md bg-white p-2 flex-1">
          <Search className="h-5 w-5 text-gray-400 mr-2" />
          <Input
            type="text"
            placeholder="Buscar assinaturas..."
            value={searchTerm}
            onChange={(e) => console.log('Search term changed:', e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-transparent"
          />
        </div>
        {selectedItems.size > 0 && (
          <Button 
            variant="destructive"
            onClick={() => setIsMultiDeleteDialogOpen(true)}
            className="whitespace-nowrap"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir {selectedItems.size} selecionados
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-6 w-32 bg-gray-300 rounded-md mb-4"></div>
            <div className="h-4 w-48 bg-gray-200 rounded-md"></div>
          </div>
        </div>
      ) : filteredSubscriptions.length > 0 ? (
        <div className="bg-white rounded-md shadow overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={selectedItems.size === filteredSubscriptions.length && filteredSubscriptions.length > 0}
                      onCheckedChange={selectAll}
                    />
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('title')}
                >
                  Título {renderSortIndicator('title')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('price')}
                >
                  Preço {renderSortIndicator('price')}
                </TableHead>
                <TableHead 
                  className="hidden md:table-cell cursor-pointer"
                  onClick={() => handleSort('telegramUsername')}
                >
                  Telegram {renderSortIndicator('telegramUsername')}
                </TableHead>
                <TableHead 
                  className="hidden md:table-cell cursor-pointer"
                  onClick={() => handleSort('whatsappNumber')}
                >
                  WhatsApp {renderSortIndicator('whatsappNumber')}
                </TableHead>
                <TableHead 
                  className="hidden md:table-cell cursor-pointer"
                  onClick={() => handleSort('addedDate')}
                >
                  Adicionado em {renderSortIndicator('addedDate')}
                </TableHead>
                <TableHead 
                  className="hidden md:table-cell cursor-pointer"
                  onClick={() => handleSort('featured')}
                >
                  Destaque {renderSortIndicator('featured')}
                </TableHead>
                <TableHead 
                  className="hidden md:table-cell cursor-pointer"
                  onClick={() => handleSort('visible')}
                >
                  Aprovado? {renderSortIndicator('visible')}
                </TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={selectedItems.has(subscription.id!)}
                        onCheckedChange={() => toggleItemSelection(subscription.id!)}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      {subscription.title}
                      {subscription.isMemberSubmission && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          <User className="h-3 w-3 mr-1" />
                          Membro
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{subscription.price}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {subscription.telegramUsername ? (
                      <a 
                        href={getTelegramLink(subscription.telegramUsername)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        <Send className="h-3 w-3 mr-1" />
                        {subscription.telegramUsername}
                      </a>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {subscription.whatsappNumber ? (
                      <a 
                        href={getWhatsappLink(subscription.whatsappNumber)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline flex items-center"
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {subscription.whatsappNumber}
                      </a>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{subscription.addedDate || '-'}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {subscription.featured ? 'Sim' : 'Não'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center">
                      <Switch
                        checked={subscription.visible ?? true}
                        onCheckedChange={() => handleToggleVisibility(subscription.id!, subscription.visible ?? true)}
                      />
                      <span className="ml-2">{subscription.visible ? 'Sim' : 'Não'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      {/* Primeira linha de botões */}
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
                          onClick={() => downloadSubscriptionAsTxt(subscription)}
                          title="Salvar como TXT"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Segunda linha de botões */}
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-green-500 hover:text-green-700"
                          onClick={() => window.open(getWhatsAppShareLink(subscription), '_blank')}
                          title="Compartilhar via WhatsApp"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-blue-500 hover:text-blue-700"
                          onClick={() => window.open(getTelegramShareLink(subscription), '_blank')}
                          title="Compartilhar via Telegram"
                        >
                          <Send className="h-4 w-4" />
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
          <Button 
            variant="link" 
            onClick={fetchSubscriptions}
            className="mt-4"
          >
            Recarregar lista
          </Button>
        </div>
      )}

      {/* Diálogo de confirmação para exclusão única */}
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

      {/* Diálogo de confirmação para exclusão múltipla */}
      <AlertDialog open={isMultiDeleteDialogOpen} onOpenChange={setIsMultiDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {selectedItems.size} assinaturas?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. As assinaturas selecionadas serão permanentemente excluídas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteMultipleConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir {selectedItems.size} assinaturas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SubscriptionList;
