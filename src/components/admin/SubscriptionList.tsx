
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
  AlertTriangle, 
  Loader2, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  Home 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionData } from '@/types/subscriptionTypes';
import { useToast } from '@/hooks/use-toast';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from '@/hooks/use-mobile';

type SortField = 'title' | 'price' | 'status' | 'addedDate' | 'telegramUsername';
type SortDirection = 'asc' | 'desc';

const SubscriptionList: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [sortField, setSortField] = useState<SortField>('addedDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  const [bulkDeleteMode, setBulkDeleteMode] = useState<boolean>(false);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('added_date', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        const formattedData: SubscriptionData[] = data.map(item => ({
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
          pixQrCode: item.pix_qr_code
        }));
        
        // Remove duplicates (based on title + telegramUsername)
        const uniqueSubscriptions = removeDuplicates(formattedData);
        setSubscriptions(uniqueSubscriptions);
        
        // Reset selected items
        const initialSelected: Record<string, boolean> = {};
        uniqueSubscriptions.forEach(sub => {
          if (sub.id) initialSelected[sub.id] = false;
        });
        setSelectedItems(initialSelected);
      }
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

  const removeDuplicates = (subs: SubscriptionData[]): SubscriptionData[] => {
    const seen = new Map();
    return subs.filter(sub => {
      // Create a unique key for each subscription
      const key = `${sub.title}-${sub.telegramUsername}`.toLowerCase();
      
      // If we've seen this key before, filter it out
      if (seen.has(key)) {
        return false;
      }
      
      // Otherwise, add to seen and keep it
      seen.set(key, true);
      return true;
    });
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
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir anúncio",
        description: err.message
      });
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const changeSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4 ml-1" /> 
      : <ArrowDown className="h-4 w-4 ml-1" />;
  };

  // Handle bulk selection and deletion
  const toggleSelectAll = () => {
    const allSelected = Object.values(selectedItems).every(Boolean);
    const newSelectedItems: Record<string, boolean> = {};
    
    subscriptions.forEach(sub => {
      if (sub.id) newSelectedItems[sub.id] = !allSelected;
    });
    
    setSelectedItems(newSelectedItems);
  };

  const toggleSelectItem = (id: string | undefined) => {
    if (!id) return;
    setSelectedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleBulkDelete = async () => {
    try {
      setIsDeleting(true);
      
      const selectedIds = Object.entries(selectedItems)
        .filter(([_, value]) => value)
        .map(([key, _]) => key);
      
      if (selectedIds.length === 0) {
        toast({
          title: "Nenhum anúncio selecionado",
          description: "Selecione pelo menos um anúncio para excluir.",
          variant: "destructive"
        });
        return;
      }
      
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .in('id', selectedIds);
      
      if (error) throw error;
      
      setSubscriptions(subscriptions.filter(sub => 
        !selectedIds.includes(sub.id || '')
      ));
      
      toast({
        title: "Anúncios excluídos",
        description: `${selectedIds.length} anúncios foram excluídos com sucesso.`
      });
      
      // Reset selected items
      const newSelectedItems: Record<string, boolean> = {};
      subscriptions.forEach(sub => {
        if (sub.id && !selectedIds.includes(sub.id)) {
          newSelectedItems[sub.id] = false;
        }
      });
      setSelectedItems(newSelectedItems);
      setBulkDeleteMode(false);
      
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

  const getSelectedCount = () => {
    return Object.values(selectedItems).filter(Boolean).length;
  };

  // Filter and sort subscriptions
  const filteredAndSortedSubscriptions = () => {
    // First, filter by search term
    let filtered = searchTerm
      ? subscriptions.filter(sub => 
          sub.title.toLowerCase().includes(searchTerm) || 
          sub.paymentMethod.toLowerCase().includes(searchTerm) ||
          sub.telegramUsername.toLowerCase().includes(searchTerm) ||
          (sub.addedDate?.toLowerCase() || '').includes(searchTerm)
        )
      : subscriptions;

    // Then sort
    return filtered.sort((a, b) => {
      let valueA: any, valueB: any;
      
      // Determine values to compare based on sort field
      switch(sortField) {
        case 'title':
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
          break;
        case 'price':
          valueA = a.price;
          valueB = b.price;
          break;
        case 'status':
          valueA = a.status;
          valueB = b.status;
          break;
        case 'telegramUsername':
          valueA = a.telegramUsername.toLowerCase();
          valueB = b.telegramUsername.toLowerCase();
          break;
        case 'addedDate':
          // Convert date strings to comparable values
          if (a.addedDate && b.addedDate) {
            // Format is DD/MM/YYYY
            const [dayA, monthA, yearA] = a.addedDate.split('/').map(Number);
            const [dayB, monthB, yearB] = b.addedDate.split('/').map(Number);
            
            valueA = new Date(yearA, monthA - 1, dayA).getTime();
            valueB = new Date(yearB, monthB - 1, dayB).getTime();
          } else {
            valueA = a.addedDate || '';
            valueB = b.addedDate || '';
          }
          break;
        default:
          valueA = a[sortField as keyof SubscriptionData];
          valueB = b[sortField as keyof SubscriptionData];
      }
      
      // Handle sorting direction
      if (sortDirection === 'asc') {
        return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
      } else {
        return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
      }
    });
  };

  return (
    <div className="max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Anúncios</h1>
        <div className="flex flex-wrap gap-2">
          {bulkDeleteMode ? (
            <>
              <Button 
                variant="destructive" 
                disabled={isDeleting || getSelectedCount() === 0}
                onClick={handleBulkDelete}
                className="flex gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-5 w-5" />
                    Excluir ({getSelectedCount()})
                  </>
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setBulkDeleteMode(false)}
                className="flex gap-2"
              >
                <X className="h-5 w-5" />
                Cancelar
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline"
                onClick={() => navigate('/')} 
                className="flex gap-2"
              >
                <Home className="h-5 w-5" />
                {!isMobile && "Início"}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setBulkDeleteMode(true)} 
                className="flex gap-2"
              >
                <Trash2 className="h-5 w-5" />
                {!isMobile && "Excluir Vários"}
              </Button>
              <Button 
                onClick={() => navigate('/admin/subscriptions/new')} 
                className="flex gap-2"
              >
                <Plus className="h-5 w-5" />
                {!isMobile && "Novo Anúncio"}
              </Button>
            </>
          )}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md flex items-center gap-3 mb-6">
          <AlertTriangle className="text-red-500" />
          <span className="text-red-600">{error}</span>
        </div>
      )}
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <Input
          placeholder="Pesquisar anúncios..."
          value={searchTerm}
          onChange={handleSearch}
          className="max-w-md"
        />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex gap-2">
              Ordenar por
              {getSortIcon(sortField)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Escolha um campo</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => changeSort('title')}>
              Título {getSortIcon('title')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => changeSort('price')}>
              Preço {getSortIcon('price')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => changeSort('status')}>
              Status {getSortIcon('status')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => changeSort('addedDate')}>
              Data {getSortIcon('addedDate')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => changeSort('telegramUsername')}>
              Telegram {getSortIcon('telegramUsername')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {bulkDeleteMode && (
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={Object.values(selectedItems).every(Boolean) && Object.keys(selectedItems).length > 0}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Selecionar todos"
                  />
                </TableHead>
              )}
              <TableHead 
                className="w-[300px] cursor-pointer"
                onClick={() => changeSort('title')}
              >
                <div className="flex items-center">
                  Título {getSortIcon('title')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => changeSort('price')}
              >
                <div className="flex items-center">
                  Preço {getSortIcon('price')}
                </div>
              </TableHead>
              <TableHead 
                className="hidden sm:table-cell cursor-pointer"
                onClick={() => changeSort('status')}
              >
                <div className="flex items-center">
                  Status {getSortIcon('status')}
                </div>
              </TableHead>
              <TableHead 
                className="hidden lg:table-cell cursor-pointer"
                onClick={() => changeSort('addedDate')}
              >
                <div className="flex items-center">
                  Data {getSortIcon('addedDate')}
                </div>
              </TableHead>
              <TableHead 
                className="hidden md:table-cell cursor-pointer"
                onClick={() => changeSort('telegramUsername')}
              >
                <div className="flex items-center">
                  Telegram {getSortIcon('telegramUsername')}
                </div>
              </TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={bulkDeleteMode ? 7 : 6} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="mt-2 text-muted-foreground">Carregando anúncios...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredAndSortedSubscriptions().length === 0 ? (
              <TableRow>
                <TableCell colSpan={bulkDeleteMode ? 7 : 6} className="h-24 text-center">
                  {searchTerm ? "Nenhum resultado encontrado" : "Nenhum anúncio cadastrado"}
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedSubscriptions().map((subscription) => (
                <TableRow key={subscription.id}>
                  {bulkDeleteMode && (
                    <TableCell className="px-2 py-2">
                      <Checkbox
                        checked={selectedItems[subscription.id || ''] || false}
                        onCheckedChange={() => toggleSelectItem(subscription.id)}
                        aria-label={`Selecionar ${subscription.title}`}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium">
                    {subscription.title}
                  </TableCell>
                  <TableCell>{subscription.price}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {subscription.status}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {subscription.addedDate}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {subscription.telegramUsername}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/subscriptions/edit/${subscription.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {!bulkDeleteMode && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => confirmDelete(subscription.id || '')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente este anúncio.
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
    </div>
  );
};

export default SubscriptionList;
