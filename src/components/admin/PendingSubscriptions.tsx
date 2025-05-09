import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, CheckCircle, XCircle, MoreHorizontal, ChevronDown, Edit, Trash, MessageSquare } from 'lucide-react';
import { PendingSubscriptionFromSupabase } from '@/types/subscriptionTypes';

const PendingSubscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<PendingSubscriptionFromSupabase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string>('submitted_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<PendingSubscriptionFromSupabase | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<string[]>([]);
  const [columnsWidth, setColumnsWidth] = useState<{[key: string]: number}>({
    title: 250,
    price: 100,
    telegram: 150,
    whatsapp: 150,
    status: 120,
    access: 150,
    payment: 150,
    date: 180,
    approval: 150,
    actions: 100,
  });
  const [resizing, setResizing<{column: string | null, startX: number, startWidth: number}>({
    column: null,
    startX: 0,
    startWidth: 0
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    fetchPendingSubscriptions();
  }, [sortColumn, sortDirection]);

  const fetchPendingSubscriptions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pending_subscriptions')
        .select('*')
        .order(sortColumn, { ascending: sortDirection === 'asc' });

      if (error) throw error;
      
      setSubscriptions(data || []);
    } catch (error: any) {
      console.error("Error fetching pending subscriptions:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar anúncios pendentes",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleApprove = async (subscription: PendingSubscriptionFromSupabase) => {
    setSelectedSubscription(subscription);
    
    try {
      // Generate a subscription code if not exists
      const code = subscription.code || `SF${Math.floor(1000 + Math.random() * 9000)}`;
      
      // Insert into subscriptions table
      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert({
          title: subscription.title,
          price: subscription.price,
          access: subscription.access,
          payment_method: subscription.payment_method,
          telegram_username: subscription.telegram_username,
          whatsapp_number: subscription.whatsapp_number,
          status: subscription.status,
          header_color: subscription.header_color || 'bg-blue-600',
          price_color: subscription.price_color || 'text-green-600',
          code: code,
          added_date: new Date().toLocaleDateString('pt-BR'),
          user_id: subscription.user_id,
          icon: subscription.icon,
          pix_key: subscription.pix_key,
          pix_qr_code: subscription.pix_qr_code,
          payment_proof_image: subscription.payment_proof_image
        });
      
      if (insertError) throw insertError;

      // Update pending_subscriptions status
      const { error: updateError } = await supabase
        .from('pending_subscriptions')
        .update({
          status_approval: 'approved',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', subscription.id);
        
      if (updateError) throw updateError;
      
      // Update the local state
      setSubscriptions(prev => 
        prev.map(sub => 
          sub.id === subscription.id 
            ? { ...sub, status_approval: 'approved' } 
            : sub
        )
      );
      
      toast({
        title: 'Anúncio aprovado',
        description: 'O anúncio foi aprovado e adicionado à lista pública.'
      });
    } catch (error: any) {
      console.error("Error approving subscription:", error);
      toast({
        variant: "destructive",
        title: "Erro ao aprovar anúncio",
        description: error.message
      });
    }
  };

  const handleRejectClick = (subscription: PendingSubscriptionFromSupabase) => {
    setSelectedSubscription(subscription);
    setRejectionReason('');
    setReviewDialogOpen(true);
  };

  const confirmReject = async () => {
    if (!selectedSubscription) return;
    
    try {
      const { error } = await supabase
        .from('pending_subscriptions')
        .update({
          status_approval: 'rejected',
          rejection_reason: rejectionReason,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', selectedSubscription.id);
      
      if (error) throw error;
      
      // Update the local state
      setSubscriptions(prev => 
        prev.map(sub => 
          sub.id === selectedSubscription.id 
            ? { ...sub, status_approval: 'rejected', rejection_reason: rejectionReason } 
            : sub
        )
      );
      
      toast({
        title: 'Anúncio rejeitado',
        description: 'O anúncio foi marcado como rejeitado.'
      });
      
      setReviewDialogOpen(false);
    } catch (error: any) {
      console.error("Error rejecting subscription:", error);
      toast({
        variant: "destructive",
        title: "Erro ao rejeitar anúncio",
        description: error.message
      });
    }
  };

  const handleDeleteClick = (subscription: PendingSubscriptionFromSupabase) => {
    setSelectedSubscription(subscription);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedSubscription) return;
    
    try {
      const { error } = await supabase
        .from('pending_subscriptions')
        .delete()
        .eq('id', selectedSubscription.id);
      
      if (error) throw error;
      
      // Update the local state
      setSubscriptions(prev => prev.filter(sub => sub.id !== selectedSubscription.id));
      
      toast({
        title: 'Anúncio excluído',
        description: 'O anúncio pendente foi excluído com sucesso.'
      });
      
      setDeleteDialogOpen(false);
    } catch (error: any) {
      console.error("Error deleting subscription:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir anúncio",
        description: error.message
      });
    }
  };

  const handleEdit = (subscription: PendingSubscriptionFromSupabase) => {
    navigate(`/admin/subscriptions/edit/${subscription.id}`, { 
      state: { subscriptionData: subscription, isPending: true }
    });
  };

  const toggleSubscriptionSelection = (id: string) => {
    setSelectedSubscriptions(prev => {
      if (prev.includes(id)) {
        return prev.filter(subId => subId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedSubscriptions.length === filteredSubscriptions.length) {
      // If all are selected, unselect all
      setSelectedSubscriptions([]);
    } else {
      // Otherwise, select all
      setSelectedSubscriptions(filteredSubscriptions.map(sub => sub.id));
    }
  };

  const confirmBulkDelete = async () => {
    if (selectedSubscriptions.length === 0) return;
    
    try {
      const { error } = await supabase
        .from('pending_subscriptions')
        .delete()
        .in('id', selectedSubscriptions);
      
      if (error) throw error;
      
      // Update the local state
      setSubscriptions(prev => prev.filter(sub => !selectedSubscriptions.includes(sub.id)));
      
      toast({
        title: 'Anúncios excluídos',
        description: `${selectedSubscriptions.length} anúncios foram excluídos com sucesso.`
      });
      
      setSelectedSubscriptions([]);
      setBulkDeleteDialogOpen(false);
    } catch (error: any) {
      console.error("Error deleting subscriptions:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir anúncios",
        description: error.message
      });
    }
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

  const filteredSubscriptions = subscriptions.filter(sub => 
    sub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.price.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.telegram_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.access.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Anúncios Pendentes</h1>
      </div>

      <div className="flex flex-wrap gap-2 justify-between items-center">
        <div className="w-full max-w-sm">
          <Input 
            placeholder="Buscar anúncios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          {selectedSubscriptions.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteDialogOpen(true)}
            >
              Excluir {selectedSubscriptions.length} selecionados
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto">
                <ChevronDown className="h-4 w-4 mr-2" />
                Ordenar por
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleSort('title')}>
                Título {sortColumn === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('price')}>
                Preço {sortColumn === 'price' && (sortDirection === 'asc' ? '↑' : '↓')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('submitted_at')}>
                Data de envio {sortColumn === 'submitted_at' && (sortDirection === 'asc' ? '↑' : '↓')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort('status_approval')}>
                Status {sortColumn === 'status_approval' && (sortDirection === 'asc' ? '↑' : '↓')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="border rounded-md overflow-auto">
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <Table ref={tableRef} className="relative w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <input 
                    type="checkbox" 
                    checked={selectedSubscriptions.length === filteredSubscriptions.length && filteredSubscriptions.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </TableHead>
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
                  style={{ width: `${columnsWidth.access}px` }}
                >
                  Acesso
                  <div 
                    className="absolute right-0 top-0 h-full w-2 cursor-col-resize"
                    onMouseDown={(e) => startResizing('access', e)}
                  ></div>
                </TableHead>
                <TableHead 
                  className="relative cursor-col-resize" 
                  style={{ width: `${columnsWidth.payment}px` }}
                >
                  Pagamento
                  <div 
                    className="absolute right-0 top-0 h-full w-2 cursor-col-resize"
                    onMouseDown={(e) => startResizing('payment', e)}
                  ></div>
                </TableHead>
                <TableHead 
                  className="relative cursor-col-resize" 
                  style={{ width: `${columnsWidth.date}px` }}
                >
                  Data do Anúncio
                  <div 
                    className="absolute right-0 top-0 h-full w-2 cursor-col-resize"
                    onMouseDown={(e) => startResizing('date', e)}
                  ></div>
                </TableHead>
                <TableHead 
                  className="relative cursor-col-resize" 
                  style={{ width: `${columnsWidth.approval}px` }}
                >
                  Aprovação
                  <div 
                    className="absolute right-0 top-0 h-full w-2 cursor-col-resize"
                    onMouseDown={(e) => startResizing('approval', e)}
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
              {filteredSubscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-10 text-gray-500">
                    Nenhum anúncio pendente encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell>
                      <input 
                        type="checkbox" 
                        checked={selectedSubscriptions.includes(subscription.id)} 
                        onChange={() => toggleSubscriptionSelection(subscription.id)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell>
                      {subscription.title}
                    </TableCell>
                    <TableCell>
                      {subscription.price}
                    </TableCell>
                    <TableCell>
                      {subscription.telegram_username || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {subscription.whatsapp_number || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <span className={
                        subscription.status === 'disponível' 
                          ? 'bg-green-100 text-green-800 px-2 py-1 rounded text-xs'
                          : 'bg-red-100 text-red-800 px-2 py-1 rounded text-xs'
                      }>
                        {subscription.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {subscription.access}
                    </TableCell>
                    <TableCell>
                      {subscription.payment_method}
                    </TableCell>
                    <TableCell>
                      {subscription.reviewed_at 
                        ? new Date(subscription.reviewed_at).toLocaleDateString() 
                        : (subscription.submitted_at 
                          ? new Date(subscription.submitted_at).toLocaleDateString() 
                          : 'N/A')}
                    </TableCell>
                    <TableCell>
                      <span className={
                        subscription.status_approval === 'approved' 
                          ? 'bg-green-100 text-green-800 px-2 py-1 rounded text-xs'
                          : subscription.status_approval === 'rejected'
                            ? 'bg-red-100 text-red-800 px-2 py-1 rounded text-xs'
                            : 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs'
                      }>
                        {subscription.status_approval === 'approved' 
                          ? 'Aprovado' 
                          : subscription.status_approval === 'rejected' 
                          ? 'Rejeitado' 
                          : 'Pendente'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        {!subscription.status_approval || subscription.status_approval === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleApprove(subscription)}
                              className="text-green-600 hover:text-green-800 hover:bg-green-50"
                              title="Aprovar"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRejectClick(subscription)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              title="Rejeitar"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(subscription)}>
                              <Edit className="h-4 w-4 mr-2" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteClick(subscription)}>
                              <Trash className="h-4 w-4 mr-2" /> Excluir
                            </DropdownMenuItem>
                            {(!subscription.status_approval || subscription.status_approval === 'pending') && (
                              <DropdownMenuItem onClick={() => handleApprove(subscription)}>
                                <CheckCircle className="h-4 w-4 mr-2" /> Aprovar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Anúncio</DialogTitle>
            <DialogDescription>
              Por favor, forneça um motivo para a rejeição deste anúncio.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Motivo da rejeição</label>
              <Input 
                value={rejectionReason} 
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Digite o motivo da rejeição"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>Cancelar</Button>
            <Button variant="default" onClick={confirmReject}>Rejeitar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este anúncio pendente? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão em massa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir {selectedSubscriptions.length} anúncios pendentes? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmBulkDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir {selectedSubscriptions.length} anúncios
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PendingSubscriptions;
