
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Edit, 
  Trash2, 
  PlusCircle, 
  Loader2, 
  AlertTriangle,
  Download,
  ArrowUpDown,
  Star
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { exportSubscriptionsAsTxt } from '@/utils/exportHelpers';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface Subscription {
  id: string;
  title: string;
  price: string;
  payment_method: string;
  status: string;
  access: string;
  whatsapp_number: string;
  telegram_username: string;
  header_color?: string;
  price_color?: string;
  icon?: string;
  added_date?: string;
  featured?: boolean;
  pix_qr_code?: string;
  pix_key?: string;
  payment_proof_image?: string;
  código?: number;
}

const SubscriptionList: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<Record<string, boolean>>({});
  const [deleteMultipleOpen, setDeleteMultipleOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [sortBy, setSortBy] = useState<string>('added_date');
  const [featureDialogOpen, setFeatureDialogOpen] = useState(false);
  const [featureId, setFeatureId] = useState<string | null>(null);
  const [isFeaturing, setIsFeaturing] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
  }, [sortOrder, sortBy]);

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('subscriptions')
        .select('*');
      
      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error } = await query;

      if (error) throw error;
      
      setSubscriptions(data || []);
      
      // Inicializa o estado de seleção para cada assinatura
      const initialSelected: Record<string, boolean> = {};
      data?.forEach((sub: Subscription) => {
        initialSelected[sub.id] = false;
      });
      setSelectedSubscriptions(initialSelected);
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Erro ao carregar anúncios",
        description: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', deleteId);
      
      if (error) throw error;
      
      setSubscriptions(subscriptions.filter(sub => sub.id !== deleteId));
      
      toast({
        title: "Anúncio excluído",
        description: "O anúncio foi excluído com sucesso."
      });
      
      setDeleteId(null);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir anúncio",
        description: err.message
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectSubscription = (id: string) => {
    setSelectedSubscriptions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSelectAll = () => {
    const allSelected = filteredSubscriptions.every(sub => selectedSubscriptions[sub.id]);
    const updatedSelection = { ...selectedSubscriptions };
    
    filteredSubscriptions.forEach(sub => {
      updatedSelection[sub.id] = !allSelected;
    });
    
    setSelectedSubscriptions(updatedSelection);
  };

  const handleDeleteMultiple = async () => {
    try {
      setIsDeleting(true);
      
      // Obter IDs dos anúncios selecionados
      const selectedIds = Object.entries(selectedSubscriptions)
        .filter(([_, isSelected]) => isSelected)
        .map(([id]) => id);
      
      if (selectedIds.length === 0) {
        toast({
          variant: "destructive",
          title: "Nenhum anúncio selecionado",
          description: "Selecione pelo menos um anúncio para excluir."
        });
        return;
      }
      
      // Excluir anúncios selecionados
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .in('id', selectedIds);
      
      if (error) throw error;
      
      // Atualizar lista de anúncios
      setSubscriptions(subscriptions.filter(sub => !selectedIds.includes(sub.id)));
      
      // Limpar seleções
      const newSelection: Record<string, boolean> = {};
      subscriptions.forEach(sub => {
        if (!selectedIds.includes(sub.id)) {
          newSelection[sub.id] = false;
        }
      });
      setSelectedSubscriptions(newSelection);
      
      toast({
        title: "Anúncios excluídos",
        description: `${selectedIds.length} anúncios foram excluídos com sucesso.`
      });
      
      setDeleteMultipleOpen(false);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir anúncios",
        description: err.message
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = () => {
    // Get selected subscriptions
    const selectedSubs = subscriptions.filter(sub => selectedSubscriptions[sub.id]);
    
    // Use the utility function to export subscriptions
    exportSubscriptionsAsTxt(selectedSubs);
  };
  
  const handleToggleSort = (column: string) => {
    if (sortBy === column) {
      // If already sorting by this column, toggle order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // If sorting by a new column, set it as the sort column and set order based on column
      setSortBy(column);
      
      // Default to desc for dates, asc for other fields
      if (column === 'added_date') {
        setSortOrder('desc');
      } else {
        setSortOrder('asc');
      }
    }
  };

  const confirmFeature = (id: string) => {
    setFeatureId(id);
    setFeatureDialogOpen(true);
  };

  const handleToggleFeature = async () => {
    if (!featureId) return;
    
    try {
      setIsFeaturing(true);
      
      // Get current featured status
      const subscription = subscriptions.find(sub => sub.id === featureId);
      const newFeaturedStatus = !(subscription?.featured || false);
      
      // Update featured status
      const { error } = await supabase
        .from('subscriptions')
        .update({ featured: newFeaturedStatus })
        .eq('id', featureId);
      
      if (error) throw error;
      
      // Update local state
      setSubscriptions(subscriptions.map(sub => 
        sub.id === featureId 
          ? { ...sub, featured: newFeaturedStatus } 
          : sub
      ));
      
      toast({
        title: newFeaturedStatus ? "Anúncio fixado" : "Anúncio desfixado",
        description: `O anúncio foi ${newFeaturedStatus ? 'fixado' : 'desfixado'} com sucesso.`
      });
      
      setFeatureDialogOpen(false);
      setFeatureId(null);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro ao alterar status do anúncio",
        description: err.message
      });
    } finally {
      setIsFeaturing(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => 
    sub.title.toLowerCase().includes(searchTerm) || 
    sub.telegram_username.toLowerCase().includes(searchTerm) ||
    sub.status.toLowerCase().includes(searchTerm)
  );

  const selectedCount = Object.values(selectedSubscriptions).filter(Boolean).length;
  const allSelected = filteredSubscriptions.length > 0 && filteredSubscriptions.every(sub => selectedSubscriptions[sub.id]);

  return (
    <div className="max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Anúncios</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={() => navigate('/admin/subscriptions/new')} 
            className="flex gap-2"
          >
            <PlusCircle className="h-5 w-5" />
            Novo Anúncio
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md flex items-center gap-3 mb-6">
          <AlertTriangle className="text-red-500" />
          <span className="text-red-600">{error}</span>
        </div>
      )}
      
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lista de Anúncios</CardTitle>
          <div className="flex gap-2">
            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={(value) => {
                const [newSortBy, newSortOrder] = value.split('-') as [string, 'asc' | 'desc'];
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="added_date-desc">Data (mais recente)</SelectItem>
                <SelectItem value="added_date-asc">Data (mais antigo)</SelectItem>
                <SelectItem value="title-asc">Título (A-Z)</SelectItem>
                <SelectItem value="title-desc">Título (Z-A)</SelectItem>
                <SelectItem value="código-asc">Código (crescente)</SelectItem>
                <SelectItem value="código-desc">Código (decrescente)</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={selectedCount === 0}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar ({selectedCount})
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDeleteMultipleOpen(true)}
              disabled={selectedCount === 0}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Excluir ({selectedCount})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Input
              placeholder="Pesquisar anúncios..."
              value={searchTerm}
              onChange={handleSearch}
              className="max-w-md"
            />
          </div>
          
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Selecionar todos"
                    />
                  </TableHead>
                  <TableHead className="w-16">
                    <div className="flex items-center">
                      Código
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-1 p-0" 
                        onClick={() => handleToggleSort('código')}
                      >
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableHead>
                  <TableHead className="w-[250px]">
                    <div className="flex items-center">
                      Título
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-1 p-0" 
                        onClick={() => handleToggleSort('title')}
                      >
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    <div className="flex items-center">
                      Data
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-1 p-0" 
                        onClick={() => handleToggleSort('added_date')}
                      >
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableHead>
                  <TableHead className="hidden xl:table-cell">Fixado</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <span className="mt-2 text-muted-foreground">Carregando anúncios...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredSubscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      {searchTerm ? "Nenhum resultado encontrado" : "Nenhum anúncio cadastrado"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubscriptions.map((subscription) => (
                    <TableRow key={subscription.id} className="cursor-pointer" onClick={() => handleSelectSubscription(subscription.id)}>
                      <TableCell className="p-2">
                        <Checkbox
                          checked={selectedSubscriptions[subscription.id] || false}
                          onCheckedChange={() => handleSelectSubscription(subscription.id)}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Selecionar ${subscription.title}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {subscription.código || '-'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {subscription.title}
                      </TableCell>
                      <TableCell>{subscription.price}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className={`px-2 py-1 rounded text-xs ${
                          subscription.status.includes('Aguardando') 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {subscription.status}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {subscription.added_date || '-'}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {subscription.featured ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                            <Star className="h-3 w-3 mr-1 fill-yellow-500 stroke-yellow-600" />
                            Fixado
                          </span>
                        ) : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmFeature(subscription.id);
                            }}
                            className={subscription.featured ? "bg-yellow-50 text-yellow-600" : "text-gray-600"}
                          >
                            <Star className={`h-4 w-4 ${subscription.featured ? "fill-yellow-500" : ""}`} />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/subscriptions/edit/${subscription.id}`);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDelete(subscription.id);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
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

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteMultipleOpen} onOpenChange={setDeleteMultipleOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão em massa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir {selectedCount} anúncios? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMultiple}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : `Excluir ${selectedCount} anúncios`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={featureDialogOpen} onOpenChange={setFeatureDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {featureId && subscriptions.find(sub => sub.id === featureId)?.featured 
                ? "Desafixar anúncio" 
                : "Fixar anúncio"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {featureId && subscriptions.find(sub => sub.id === featureId)?.featured 
                ? "Deseja remover este anúncio da seção de destaque na página inicial?" 
                : "Deseja fixar este anúncio na seção de destaque na página inicial?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isFeaturing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleFeature}
              className={featureId && subscriptions.find(sub => sub.id === featureId)?.featured
                ? "bg-gray-600 hover:bg-gray-700" 
                : "bg-yellow-600 hover:bg-yellow-700"}
              disabled={isFeaturing}
            >
              {isFeaturing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (featureId && subscriptions.find(sub => sub.id === featureId)?.featured
                  ? 'Desafixar'
                  : 'Fixar')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SubscriptionList;
