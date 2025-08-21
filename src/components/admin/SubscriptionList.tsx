import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Edit, Eye, EyeOff, Star, StarOff, Trash2, RefreshCw, Search, Filter, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { SubscriptionData } from '@/types/subscriptionTypes';
import { 
  getAllSubscriptions, 
  deleteSubscription, 
  toggleFeaturedStatus, 
  toggleVisibilityStatus,
  getAllCategories
} from '@/services/subscription-service';
import { editTelegramMessageFormatted, repostSubscription } from '@/services/telegram-admin';

interface SubscriptionListProps {
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
}

/**
 * Lista de assinaturas para o painel administrativo
 * @version 3.11.0
 * - Alterado botão "Compartilhar via Telegram" para "Atualizar no Telegram"
 * - Integração com função editTelegramMessageFormatted
 */
const SubscriptionList: React.FC<SubscriptionListProps> = ({ searchTerm = '', onSearchChange }) => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [updatingTelegramId, setUpdatingTelegramId] = useState<string | null>(null);
  
  // Estados dos filtros e ordenação
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterFeatured, setFilterFeatured] = useState<string>('all');
  const [filterVisible, setFilterVisible] = useState<string>('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      const subscriptions = await getAllSubscriptions();
      setSubscriptions(subscriptions);
    } catch (error: any) {
      console.error('Erro ao carregar assinaturas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de assinaturas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const categories = await getAllCategories();
      setCategories(categories);
    } catch (error: any) {
      console.error('Erro ao carregar categorias:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as categorias.",
        variant: "destructive",
      });
      setCategories(['Streaming', 'Música', 'Educação', 'YouTube', 'Produtividade']);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
    fetchCategories();
  }, []);

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // Função para ordenar assinaturas
  const sortSubscriptions = (subs: SubscriptionData[]) => {
    return [...subs].sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'title':
          aValue = (a.customTitle || a.title).toLowerCase();
          bValue = (b.customTitle || b.title).toLowerCase();
          break;
        case 'price':
          aValue = parseFloat(a.price.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
          bValue = parseFloat(b.price.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case 'category':
          aValue = (a.category || '').toLowerCase();
          bValue = (b.category || '').toLowerCase();
          break;
        case 'featured':
          aValue = a.featured ? 1 : 0;
          bValue = b.featured ? 1 : 0;
          break;
        case 'visible':
          aValue = a.visible ? 1 : 0;
          bValue = b.visible ? 1 : 0;
          break;
        case 'code':
          aValue = a.code.toLowerCase();
          bValue = b.code.toLowerCase();
          break;
        case 'date':
        default:
          // Parse date format DD/MM/YYYY
          const parseDate = (dateStr: string) => {
            if (!dateStr) return new Date(0);
            const [day, month, year] = dateStr.split('/').map(Number);
            return new Date(year, month - 1, day);
          };
          aValue = parseDate(a.addedDate || '');
          bValue = parseDate(b.addedDate || '');
          break;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const filteredAndSortedSubscriptions = sortSubscriptions(
    subscriptions.filter(subscription => {
    const searchTermLower = localSearchTerm.toLowerCase();
    const titleMatch = subscription.title.toLowerCase().includes(searchTermLower) ||
                       (subscription.customTitle && subscription.customTitle.toLowerCase().includes(searchTermLower));
    const codeMatch = subscription.code.toLowerCase().includes(searchTermLower);
    const priceMatch = subscription.price.toLowerCase().includes(searchTermLower);
    const whatsappMatch = subscription.whatsappNumber.toLowerCase().includes(searchTermLower);
    const telegramMatch = subscription.telegramUsername.toLowerCase().includes(searchTermLower);

      const categoryMatch = filterCategory === 'all' || filterCategory === '' ? true : subscription.category === filterCategory;
      const featuredMatch = filterFeatured === 'all' || filterFeatured === '' ? true : String(subscription.featured) === filterFeatured;
      const visibleMatch = filterVisible === 'all' || filterVisible === '' ? true : String(subscription.visible) === filterVisible;
      const paymentMethodMatch = filterPaymentMethod === 'all' || filterPaymentMethod === '' ? true : subscription.paymentMethod === filterPaymentMethod;

    return (
      (titleMatch || codeMatch || priceMatch || whatsappMatch || telegramMatch) &&
      categoryMatch &&
      featuredMatch &&
      visibleMatch &&
      paymentMethodMatch
    );
    })
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta assinatura? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteSubscription(id);
      setSubscriptions(subscriptions.filter(sub => sub.id !== id));
      toast({
        title: "Sucesso",
        description: "Assinatura excluída com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao excluir assinatura:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a assinatura.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleFeatured = async (id: string, featured: boolean) => {
    try {
      setTogglingId(id);
      const updatedSubscription = await toggleFeaturedStatus(id, featured);
      setSubscriptions(subscriptions.map(sub =>
        sub.id === id ? { ...sub, featured: updatedSubscription.featured } : sub
      ));
      toast({
        title: "Sucesso",
        description: `Assinatura ${featured ? 'destacada' : 'removida do destaque'} com sucesso.`,
      });
    } catch (error: any) {
      console.error('Erro ao alternar status de destaque:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status de destaque.",
        variant: "destructive",
      });
    } finally {
      setTogglingId(null);
    }
  };

  const handleToggleVisibility = async (id: string, visible: boolean) => {
    try {
      setTogglingId(id);
      const updatedSubscription = await toggleVisibilityStatus(id, visible);
      setSubscriptions(subscriptions.map(sub =>
        sub.id === id ? { ...sub, visible: updatedSubscription.visible } : sub
      ));
      toast({
        title: "Sucesso",
        description: `Assinatura ${visible ? 'tornada visível' : 'ocultada'} com sucesso.`,
      });
    } catch (error: any) {
      console.error('Erro ao alternar status de visibilidade:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status de visibilidade.",
        variant: "destructive",
      });
    } finally {
      setTogglingId(null);
    }
  };

  const handleUpdateTelegram = async (subscriptionId: string) => {
    try {
      setUpdatingTelegramId(subscriptionId);
      
      // Primeiro, tenta atualizar uma mensagem existente
      await editTelegramMessageFormatted(0, subscriptionId); // messageId será resolvido internamente
      
      toast({
        title: "Sucesso",
        description: "Assinatura atualizada no Telegram com sucesso.",
      });
    } catch (error: any) {
      // Se não conseguir atualizar, tenta repostar
      try {
        await repostSubscription(subscriptionId);
        toast({
          title: "Sucesso", 
          description: "Assinatura republicada no Telegram com sucesso.",
        });
      } catch (repostError: any) {
        console.error('Erro ao atualizar/repostar no Telegram:', repostError);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a assinatura no Telegram.",
          variant: "destructive",
        });
      }
    } finally {
      setUpdatingTelegramId(null);
    }
  };

  const clearFilters = () => {
    setFilterCategory('all');
    setFilterFeatured('all');
    setFilterVisible('all');
    setFilterPaymentMethod('all');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando assinaturas...</span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Assinaturas ({filteredAndSortedSubscriptions.length})</CardTitle>
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Data</SelectItem>
                <SelectItem value="title">Título</SelectItem>
                <SelectItem value="price">Preço</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="category">Categoria</SelectItem>
                <SelectItem value="featured">Destaque</SelectItem>
                <SelectItem value="visible">Visibilidade</SelectItem>
                <SelectItem value="code">Código</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Campo de busca principal */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por título, código, preço, WhatsApp, Telegram..."
              value={localSearchTerm}
              onChange={(e) => {
                setLocalSearchTerm(e.target.value);
                onSearchChange?.(e.target.value);
              }}
              className="pl-10"
            />
          </div>
        </div>

        {/* Filtros compactos */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.filter(category => category && category.trim() !== '').map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={filterFeatured} onValueChange={setFilterFeatured}>
              <SelectTrigger>
                <SelectValue placeholder="Destaque" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Em destaque</SelectItem>
                <SelectItem value="false">Não destacados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={filterVisible} onValueChange={setFilterVisible}>
              <SelectTrigger>
                <SelectValue placeholder="Visibilidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Visíveis</SelectItem>
                <SelectItem value="false">Ocultos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={filterPaymentMethod} onValueChange={setFilterPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Método de pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="PIX">PIX</SelectItem>
                <SelectItem value="Cartão">Cartão</SelectItem>
                <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                <SelectItem value="Outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Destaque</TableHead>
                <TableHead>Visibilidade</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedSubscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  {localSearchTerm || (filterCategory !== 'all' && filterCategory !== '') || (filterFeatured !== 'all' && filterFeatured !== '') || (filterVisible !== 'all' && filterVisible !== '') || (filterPaymentMethod !== 'all' && filterPaymentMethod !== '')
                    ? 'Nenhuma assinatura encontrada com os filtros aplicados.'
                    : 'Nenhuma assinatura encontrada.'
                  }
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedSubscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="mb-1">{subscription.customTitle || subscription.title}</div>
                        <div className="flex flex-wrap gap-1">
                          {subscription.isMemberSubmission && (
                            <Badge variant="secondary" className="text-xs">
                              Enviado por membro
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs bg-blue-50">
                            {subscription.paymentMethod}
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-green-50">
                            {subscription.access}
                          </Badge>
                          {subscription.whatsappNumber && (
                            <Badge variant="outline" className="text-xs bg-emerald-50">
                              WhatsApp
                            </Badge>
                          )}
                          {subscription.telegramUsername && (
                            <Badge variant="outline" className="text-xs bg-sky-50">
                              Telegram
                            </Badge>
                          )}
                          {subscription.pixKey && (
                            <Badge variant="outline" className="text-xs bg-purple-50">
                              PIX
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{subscription.price}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{subscription.status}</Badge>
                    </TableCell>
                    <TableCell>{subscription.category || '-'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {subscription.addedDate || '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleFeatured(subscription.id!, !subscription.featured)}
                        disabled={togglingId === subscription.id}
                        className="h-8 w-8 p-0"
                      >
                        {togglingId === subscription.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : subscription.featured ? (
                          <Star className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <StarOff className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleVisibility(subscription.id!, !subscription.visible)}
                        disabled={togglingId === subscription.id}
                        className="h-8 w-8 p-0"
                      >
                        {togglingId === subscription.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : subscription.visible ? (
                          <Eye className="h-4 w-4 text-green-500" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-red-500" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {subscription.code}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/admin/subscriptions/edit/${subscription.id}`)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleUpdateTelegram(subscription.id!)}
                          disabled={updatingTelegramId === subscription.id}
                          className="h-8 w-8 p-0"
                          title="Atualizar no Telegram"
                        >
                          {updatingTelegramId === subscription.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(subscription.id!)}
                          disabled={deletingId === subscription.id}
                          className="h-8 w-8 p-0"
                        >
                          {deletingId === subscription.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionList;
