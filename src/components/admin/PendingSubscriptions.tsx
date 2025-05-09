
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Eye, CheckCircle, XCircle, MoreHorizontal, ChevronDown, Edit, Trash, MessageSquare } from 'lucide-react';
import { PendingSubscriptionFromSupabase } from '@/types/subscriptionTypes';
import PendingSubscriptionForm from './PendingSubscriptionForm';
import { approvePendingSubscription } from '@/data/subscriptions';

const PendingSubscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<PendingSubscriptionFromSupabase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string>('submitted_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedSubscription, setSelectedSubscription] = useState<PendingSubscriptionFromSupabase | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

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
      const result = await approvePendingSubscription(subscription.id);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Show success message
      toast({
        title: 'Anúncio aprovado',
        description: 'O anúncio foi aprovado e adicionado à lista pública.'
      });
      
      // Refresh data
      fetchPendingSubscriptions();
    } catch (error: any) {
      console.error("Error approving subscription:", error);
      toast({
        variant: "destructive",
        title: "Erro ao aprovar anúncio",
        description: error.message || 'Ocorreu um erro ao aprovar o anúncio'
      });
    }
  };

  const handleRejectClick = (subscription: PendingSubscriptionFromSupabase) => {
    setSelectedSubscription(subscription);
    setRejectionReason('');
    setIsReviewDialogOpen(true);
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
      
      toast({
        title: 'Anúncio rejeitado',
        description: 'O anúncio foi marcado como rejeitado.'
      });
      
      setIsReviewDialogOpen(false);
      fetchPendingSubscriptions();
    } catch (error: any) {
      console.error("Error rejecting subscription:", error);
      toast({
        variant: "destructive",
        title: "Erro ao rejeitar anúncio",
        description: error.message
      });
    }
  };

  const handleEdit = (subscription: PendingSubscriptionFromSupabase) => {
    setSelectedSubscription(subscription);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async (data: any) => {
    if (!selectedSubscription) return;
    
    try {
      const { error } = await supabase
        .from('pending_subscriptions')
        .update(data)
        .eq('id', selectedSubscription.id);
      
      if (error) throw error;
      
      toast({
        title: 'Anúncio atualizado',
        description: 'O anúncio foi atualizado com sucesso.'
      });
      
      setIsEditDialogOpen(false);
      fetchPendingSubscriptions();
    } catch (error: any) {
      console.error("Error updating subscription:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar anúncio",
        description: error.message
      });
    }
  };

  const handleDeleteClick = (subscription: PendingSubscriptionFromSupabase) => {
    setSelectedSubscription(subscription);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedSubscription) return;
    
    try {
      const { error } = await supabase
        .from('pending_subscriptions')
        .delete()
        .eq('id', selectedSubscription.id);
      
      if (error) throw error;
      
      toast({
        title: 'Anúncio excluído',
        description: 'O anúncio pendente foi excluído com sucesso.'
      });
      
      setIsDeleteDialogOpen(false);
      fetchPendingSubscriptions();
    } catch (error: any) {
      console.error("Error deleting subscription:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir anúncio",
        description: error.message
      });
    }
  };

  // Filter the subscriptions based on search term
  const filteredSubscriptions = subscriptions.filter(sub => 
    sub.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.price?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.telegram_username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.access?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Anúncios Pendentes</h1>
        <Button onClick={() => navigate('/admin/subscriptions/new')}>Novo Anúncio</Button>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Acesso</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Aprovação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                    Nenhum anúncio pendente encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell className="font-medium">{subscription.title}</TableCell>
                    <TableCell>{subscription.price}</TableCell>
                    <TableCell>
                      <span className={
                        subscription.status === 'disponível' 
                          ? 'bg-green-100 text-green-800 px-2 py-1 rounded text-xs'
                          : 'bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs'
                      }>
                        {subscription.status}
                      </span>
                    </TableCell>
                    <TableCell>{subscription.access}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm">
                        <span>{subscription.telegram_username}</span>
                        <span>{subscription.whatsapp_number}</span>
                      </div>
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
                        {(!subscription.status_approval || subscription.status_approval === 'pending') && (
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(subscription)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(subscription)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          title="Excluir"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Anúncio</DialogTitle>
          </DialogHeader>
          {selectedSubscription && (
            <PendingSubscriptionForm 
              initialData={selectedSubscription}
              onSave={handleSaveEdit}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
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
              <Textarea 
                value={rejectionReason} 
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Digite o motivo da rejeição"
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmReject}>Rejeitar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
    </div>
  );
};

export default PendingSubscriptions;
