
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionFromSupabase } from '@/types/subscriptionTypes';
import { Button } from "@/components/ui/button";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, Trash, MoreVertical, ExternalLink, Star } from 'lucide-react';
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
import { toggleFeaturedStatus } from '@/data/subscriptions';

const SubscriptionList = () => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionFromSupabase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState({ key: 'added_date', direction: 'desc' });
  const [columnsWidth, setColumnsWidth] = useState<{[key: string]: number}>({
    title: 250,
    price: 100,
    status: 120,
    telegram: 150,
    whatsapp: 150,
    date: 120,
    featured: 80,
    actions: 80,
  });
  const [resizing, setResizing] = useState<{column: string | null, startX: number, startWidth: number}>({
    column: null,
    startX: 0,
    startWidth: 0
  });
  const tableRef = useRef<HTMLTableElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*');
      
      if (error) throw error;
      
      setSubscriptions(data || []);
    } catch (error: any) {
      console.error("Error fetching subscriptions:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar anúncios",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/subscriptions/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!subscriptionToDelete) return;
    
    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', subscriptionToDelete);
      
      if (error) throw error;
      
      setSubscriptions(prev => prev.filter(sub => sub.id !== subscriptionToDelete));
      toast({
        title: "Anúncio excluído",
        description: "O anúncio foi excluído com sucesso."
      });
    } catch (error: any) {
      console.error("Error deleting subscription:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir anúncio",
        description: error.message
      });
    } finally {
      setSubscriptionToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const { success, error } = await toggleFeaturedStatus(id, !currentStatus);
      
      if (success) {
        // Update local state
        setSubscriptions(prev => 
          prev.map(sub => 
            sub.id === id ? { ...sub, featured: !currentStatus } : sub
          )
        );
        
        toast({
          title: !currentStatus ? "Anúncio destacado" : "Destaque removido",
          description: !currentStatus 
            ? "O anúncio foi marcado como destaque." 
            : "O destaque do anúncio foi removido."
        });
      } else if (error) {
        throw new Error(error);
      }
    } catch (error: any) {
      console.error("Error toggling featured status:", error);
      toast({
        variant: "destructive",
        title: "Erro ao alterar destaque",
        description: error.message
      });
    }
  };

  const confirmDelete = (id: string) => {
    setSubscriptionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleSort = (key: string) => {
    setSortConfig(prevConfig => {
      if (prevConfig.key === key) {
        // If same key, toggle direction
        return {
          key,
          direction: prevConfig.direction === 'asc' ? 'desc' : 'asc'
        };
      } else {
        // If different key, default to ascending
        return { key, direction: 'asc' };
      }
    });
  };

  const startResizing = (columnName: string, e: React.MouseEvent) => {
    e.preventDefault();
    setResizing({
      column: columnName,
      startX: e.clientX,
      startWidth: columnsWidth[columnName] || 100
    });
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
  };
  
  const handleMouseMove = (e: MouseEvent) => {
    if (!resizing.column) return;
    
    const width = Math.max(50, resizing.startWidth + (e.clientX - resizing.startX));
    setColumnsWidth(prev => ({
      ...prev,
      [resizing.column!]: width
    }));
  };
  
  const stopResizing = () => {
    setResizing({ column: null, startX: 0, startWidth: 0 });
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
  };

  const getSortedSubscriptions = () => {
    const filtered = subscriptions.filter(sub => 
      sub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.price.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.telegram_username && sub.telegram_username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sub.whatsapp_number && sub.whatsapp_number.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    return [...filtered].sort((a, b) => {
      if (sortConfig.key === 'added_date') {
        const dateA = a.added_date ? new Date(a.added_date).getTime() : 0;
        const dateB = b.added_date ? new Date(b.added_date).getTime() : 0;
        
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Lista de Anúncios</h1>
        <Button onClick={() => navigate('/admin/subscriptions/new')}>Novo Anúncio</Button>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="w-full max-w-sm">
          <Input 
            placeholder="Buscar anúncios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSort('added_date')}
            className={sortConfig.key === 'added_date' ? 'border-blue-500' : ''}
          >
            Data {sortConfig.key === 'added_date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSort('title')}
            className={sortConfig.key === 'title' ? 'border-blue-500' : ''}
          >
            Título {sortConfig.key === 'title' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSort('status')}
            className={sortConfig.key === 'status' ? 'border-blue-500' : ''}
          >
            Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table ref={tableRef} className="relative w-full">
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="relative cursor-col-resize" 
                  style={{ width: `${columnsWidth.title}px` }}
                >
                  Título
                  <div 
                    className="absolute right-0 top-0 h-full w-2 cursor-col-resize"
                    onMouseDown={(e) => startResizing('title', e)}
                  ></div>
                </TableHead>
                <TableHead 
                  className="relative cursor-col-resize" 
                  style={{ width: `${columnsWidth.price}px` }}
                >
                  Preço
                  <div 
                    className="absolute right-0 top-0 h-full w-2 cursor-col-resize"
                    onMouseDown={(e) => startResizing('price', e)}
                  ></div>
                </TableHead>
                <TableHead 
                  className="relative cursor-col-resize" 
                  style={{ width: `${columnsWidth.status}px` }}
                >
                  Status
                  <div 
                    className="absolute right-0 top-0 h-full w-2 cursor-col-resize"
                    onMouseDown={(e) => startResizing('status', e)}
                  ></div>
                </TableHead>
                <TableHead 
                  className="relative cursor-col-resize" 
                  style={{ width: `${columnsWidth.telegram}px` }}
                >
                  Telegram
                  <div 
                    className="absolute right-0 top-0 h-full w-2 cursor-col-resize"
                    onMouseDown={(e) => startResizing('telegram', e)}
                  ></div>
                </TableHead>
                <TableHead 
                  className="relative cursor-col-resize" 
                  style={{ width: `${columnsWidth.whatsapp}px` }}
                >
                  WhatsApp
                  <div 
                    className="absolute right-0 top-0 h-full w-2 cursor-col-resize"
                    onMouseDown={(e) => startResizing('whatsapp', e)}
                  ></div>
                </TableHead>
                <TableHead 
                  className="relative cursor-col-resize" 
                  style={{ width: `${columnsWidth.date}px` }}
                >
                  Data
                  <div 
                    className="absolute right-0 top-0 h-full w-2 cursor-col-resize"
                    onMouseDown={(e) => startResizing('date', e)}
                  ></div>
                </TableHead>
                <TableHead 
                  className="relative cursor-col-resize" 
                  style={{ width: `${columnsWidth.featured}px` }}
                >
                  Destaque
                  <div 
                    className="absolute right-0 top-0 h-full w-2 cursor-col-resize"
                    onMouseDown={(e) => startResizing('featured', e)}
                  ></div>
                </TableHead>
                <TableHead 
                  className="relative text-right" 
                  style={{ width: `${columnsWidth.actions}px` }}
                >
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getSortedSubscriptions().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                    Nenhum anúncio encontrado
                  </TableCell>
                </TableRow>
              ) : (
                getSortedSubscriptions().map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell className="font-medium">{subscription.title}</TableCell>
                    <TableCell>{subscription.price}</TableCell>
                    <TableCell>{subscription.status}</TableCell>
                    <TableCell>
                      {subscription.telegram_username ? (
                        <a 
                          href={`https://t.me/${subscription.telegram_username.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:underline"
                        >
                          {subscription.telegram_username}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      {subscription.whatsapp_number ? (
                        <a 
                          href={`https://wa.me/${subscription.whatsapp_number.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-green-600 hover:underline"
                        >
                          {subscription.whatsapp_number}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      {subscription.added_date ? new Date(subscription.added_date).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant={subscription.featured ? "default" : "outline"}
                        size="sm"
                        className={subscription.featured ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                        onClick={() => handleToggleFeatured(subscription.id, !!subscription.featured)}
                      >
                        <Star className={`h-4 w-4 ${subscription.featured ? "fill-white" : ""}`} />
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(subscription.id)}>
                            <Edit className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleToggleFeatured(subscription.id, !!subscription.featured)}
                          >
                            <Star className="mr-2 h-4 w-4" /> 
                            {subscription.featured ? "Remover destaque" : "Destacar"}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => confirmDelete(subscription.id)}
                            className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SubscriptionList;
