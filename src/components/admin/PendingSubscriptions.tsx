
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
import { Textarea } from "@/components/ui/textarea";
import { PendingSubscriptionFromSupabase } from '@/types/subscriptionTypes';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash, MoreVertical, ThumbsUp, ThumbsDown } from 'lucide-react';
import PendingSubscriptionForm from './PendingSubscriptionForm';
import { generateSubscriptionCode } from '@/utils/codeGenerator';

const PendingSubscriptions = () => {
  const [pendingSubs, setPendingSubs] = useState<PendingSubscriptionFromSupabase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [confirmApproveDialogOpen, setConfirmApproveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentSub, setCurrentSub] = useState<PendingSubscriptionFromSupabase | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'submitted_at', direction: 'desc' });
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingSubscriptions();
  }, []);

  const fetchPendingSubscriptions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pending_subscriptions')
        .select('*');
      
      if (error) throw error;
      
      setPendingSubs(data || []);
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

  const handleApprove = (subscription: PendingSubscriptionFromSupabase) => {
    setCurrentSub(subscription);
    setConfirmApproveDialogOpen(true);
  };

  const handleReject = (subscription: PendingSubscriptionFromSupabase) => {
    setCurrentSub(subscription);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const handleDelete = (subscription: PendingSubscriptionFromSupabase) => {
    setCurrentSub(subscription);
    setDeleteDialogOpen(true);
  };

  const handleEdit = (subscription: PendingSubscriptionFromSupabase) => {
    setCurrentSub(subscription);
    setEditDialogOpen(true);
  };

  const confirmApprove = async () => {
    if (!currentSub) return;
    
    try {
      // Generate a code for the subscription
      const code = generateSubscriptionCode('SF', 5, Math.floor(Math.random() * 999) + 1);
      
      // Create approved subscription
      const { data: newSub, error: insertError } = await supabase
        .from('subscriptions')
        .insert({
          title: currentSub.title,
          price: currentSub.price,
          payment_method: currentSub.payment_method,
          status: currentSub.status,
          access: currentSub.access,
          header_color: currentSub.header_color,
          price_color: currentSub.price_color,
          whatsapp_number: currentSub.whatsapp_number,
          telegram_username: currentSub.telegram_username,
          icon: currentSub.icon,
          added_date: currentSub.added_date,
          pix_qr_code: currentSub.pix_qr_code,
          pix_key: currentSub.pix_key,
          payment_proof_image: currentSub.payment_proof_image,
          user_id: currentSub.user_id,
          code: code
        })
        .select();
      
      if (insertError) throw insertError;
      
      // Update pending subscription status
      const { error: updateError } = await supabase
        .from('pending_subscriptions')
        .update({
          status_approval: 'approved',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', currentSub.id);
      
      if (updateError) throw updateError;
      
      // Update local state
      setPendingSubs(prev => 
        prev.map(sub => 
          sub.id === currentSub.id 
            ? { ...sub, status_approval: 'approved', reviewed_at: new Date().toISOString() } 
            : sub
        )
      );
      
      toast({
        title: "Anúncio aprovado",
        description: "O anúncio foi aprovado com sucesso."
      });
      
      setConfirmApproveDialogOpen(false);
    } catch (error: any) {
      console.error("Error approving subscription:", error);
      toast({
        variant: "destructive",
        title: "Erro ao aprovar anúncio",
        description: error.message
      });
    }
  };

  const confirmReject = async () => {
    if (!currentSub) return;
    
    try {
      const { error } = await supabase
        .from('pending_subscriptions')
        .update({
          status_approval: 'rejected',
          rejection_reason: rejectionReason,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', currentSub.id);
      
      if (error) throw error;
      
      // Update local state
      setPendingSubs(prev => 
        prev.map(sub => 
          sub.id === currentSub.id 
            ? { 
                ...sub, 
                status_approval: 'rejected',
                rejection_reason: rejectionReason,
                reviewed_at: new Date().toISOString()
              } 
            : sub
        )
      );
      
      toast({
        title: "Anúncio rejeitado",
        description: "O anúncio foi rejeitado com sucesso."
      });
      
      setRejectDialogOpen(false);
    } catch (error: any) {
      console.error("Error rejecting subscription:", error);
      toast({
        variant: "destructive",
        title: "Erro ao rejeitar anúncio",
        description: error.message
      });
    }
  };

  const confirmDelete = async () => {
    if (!currentSub) return;
    
    try {
      const { error } = await supabase
        .from('pending_subscriptions')
        .delete()
        .eq('id', currentSub.id);
      
      if (error) throw error;
      
      // Update local state
      setPendingSubs(prev => prev.filter(sub => sub.id !== currentSub.id));
      
      toast({
        title: "Anúncio excluído",
        description: "O anúncio foi excluído com sucesso."
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

  const getSortedSubscriptions = () => {
    const filtered = pendingSubs.filter(sub => 
      sub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.status_approval?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return [...filtered].sort((a, b) => {
      if (sortConfig.key === 'submitted_at' || sortConfig.key === 'added_date') {
        const dateA = a[sortConfig.key] ? new Date(a[sortConfig.key]).getTime() : 0;
        const dateB = b[sortConfig.key] ? new Date(b[sortConfig.key]).getTime() : 0;
        
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

  const handleSavePendingEdit = async (updatedData: any) => {
    if (!currentSub) return;
    
    try {
      const { error } = await supabase
        .from('pending_subscriptions')
        .update(updatedData)
        .eq('id', currentSub.id);
      
      if (error) throw error;
      
      // Update local state
      setPendingSubs(prev => 
        prev.map(sub => 
          sub.id === currentSub.id 
            ? { ...sub, ...updatedData } 
            : sub
        )
      );
      
      toast({
        title: "Anúncio atualizado",
        description: "As alterações foram salvas com sucesso."
      });
      
      setEditDialogOpen(false);
      setCurrentSub(null);
    } catch (error: any) {
      console.error("Error updating subscription:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar anúncio",
        description: error.message
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Anúncios Pendentes</h1>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="w-full max-w-sm">
          <Input 
            placeholder="Buscar anúncios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSort('submitted_at')}
            className={sortConfig.key === 'submitted_at' ? 'border-blue-500' : ''}
          >
            Data Envio {sortConfig.key === 'submitted_at' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSort('status_approval')}
            className={sortConfig.key === 'status_approval' ? 'border-blue-500' : ''}
          >
            Status {sortConfig.key === 'status_approval' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Envio</TableHead>
                <TableHead>Data Anúncio</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getSortedSubscriptions().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                    Nenhum anúncio pendente encontrado
                  </TableCell>
                </TableRow>
              ) : (
                getSortedSubscriptions().map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell className="font-medium">{subscription.title}</TableCell>
                    <TableCell>{subscription.price}</TableCell>
                    <TableCell>
                      <span className={
                        subscription.status_approval === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium'
                          : subscription.status_approval === 'approved'
                            ? 'bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium'
                            : 'bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium'
                      }>
                        {subscription.status_approval === 'pending'
                          ? 'Pendente'
                          : subscription.status_approval === 'approved'
                            ? 'Aprovado'
                            : 'Rejeitado'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {subscription.submitted_at 
                        ? new Date(subscription.submitted_at).toLocaleDateString() 
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {subscription.added_date 
                        ? new Date(subscription.added_date).toLocaleDateString() 
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {subscription.status_approval === 'pending' && (
                            <>
                              <DropdownMenuItem onClick={() => handleApprove(subscription)}>
                                <ThumbsUp className="mr-2 h-4 w-4 text-green-600" /> Aprovar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleReject(subscription)}>
                                <ThumbsDown className="mr-2 h-4 w-4 text-red-600" /> Rejeitar
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem onClick={() => handleEdit(subscription)}>
                            <Edit className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(subscription)}
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

      {/* Approve Dialog */}
      <AlertDialog open={confirmApproveDialogOpen} onOpenChange={setConfirmApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar aprovação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja aprovar este anúncio? Ele será movido para a lista de anúncios ativos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmApprove} className="bg-green-500 hover:bg-green-600">
              Aprovar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Anúncio</DialogTitle>
            <DialogDescription>
              Por favor, forneça um motivo para a rejeição deste anúncio.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Textarea
              placeholder="Informe o motivo da rejeição..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancelar</Button>
            <Button 
              onClick={confirmReject}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Rejeitar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
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
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen} className="max-w-4xl">
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Editar Anúncio Pendente</DialogTitle>
          </DialogHeader>
          
          {currentSub && (
            <div className="max-h-[70vh] overflow-y-auto py-4">
              <PendingSubscriptionForm 
                initialData={currentSub} 
                onSave={handleSavePendingEdit}
                onCancel={() => setEditDialogOpen(false)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PendingSubscriptions;
