
import React, { useState, useEffect } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertTriangle, Check, X, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
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
import { useIsMobile } from '@/hooks/use-mobile';

interface PendingSubscription {
  id: string;
  title: string;
  price: string;
  payment_method: string;
  status: string;
  access: string;
  whatsapp_number: string;
  telegram_username: string;
  added_date: string;
  status_approval: string;
  rejection_reason?: string;
  user_id: string;
  username?: string;
  header_color?: string;
  price_color?: string;
  icon?: string;
  pix_qr_code?: string;
}

interface Profile {
  id: string;
  username: string;
}

const PendingSubscriptions: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [pendingSubscriptions, setPendingSubscriptions] = useState<PendingSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubscription, setSelectedSubscription] = useState<PendingSubscription | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchPendingSubscriptions();
  }, []);

  const fetchPendingSubscriptions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Primeiro, buscar todos os perfis para mapeamento de usuários
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username');
      
      if (profilesError) throw profilesError;
      
      // Converter perfis em um mapa para facilitar a busca
      const profilesMap = new Map<string, string>();
      profiles.forEach((profile: Profile) => {
        profilesMap.set(profile.id, profile.username);
      });

      // Buscar as inscrições pendentes
      const { data: pendingSubs, error: pendingError } = await supabase
        .from('pending_subscriptions')
        .select('*');

      if (pendingError) throw pendingError;

      // Combinar os dados com os nomes de usuário
      const pendingWithUsernames = pendingSubs.map((sub: any) => ({
        ...sub,
        username: profilesMap.get(sub.user_id) || 'Sem nome',
      }));

      setPendingSubscriptions(pendingWithUsernames);
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Erro ao carregar anúncios pendentes",
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenRejectDialog = (subscription: PendingSubscription) => {
    setSelectedSubscription(subscription);
    setRejectionReason(subscription.rejection_reason || '');
    setRejectDialogOpen(true);
  };

  const handleOpenApproveDialog = (subscription: PendingSubscription) => {
    setSelectedSubscription(subscription);
    setApproveDialogOpen(true);
  };

  const handleReject = async () => {
    if (!selectedSubscription) return;

    try {
      setIsProcessing(true);

      const { error } = await supabase
        .from('pending_subscriptions')
        .update({
          status_approval: 'rejected',
          rejection_reason: rejectionReason,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', selectedSubscription.id);

      if (error) throw error;

      setPendingSubscriptions(prevSubs => 
        prevSubs.map(sub => 
          sub.id === selectedSubscription.id 
            ? { ...sub, status_approval: 'rejected', rejection_reason: rejectionReason } 
            : sub
        )
      );

      toast({
        title: "Anúncio rejeitado",
        description: "O anúncio foi rejeitado com sucesso.",
      });

      setRejectDialogOpen(false);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro ao rejeitar anúncio",
        description: err.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedSubscription) return;

    try {
      setIsProcessing(true);

      // First add to subscriptions table
      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert({
          title: selectedSubscription.title,
          price: selectedSubscription.price,
          payment_method: selectedSubscription.payment_method,
          status: selectedSubscription.status,
          access: selectedSubscription.access,
          whatsapp_number: selectedSubscription.whatsapp_number,
          telegram_username: selectedSubscription.telegram_username,
          added_date: selectedSubscription.added_date,
          header_color: selectedSubscription.header_color || 'bg-blue-600',
          price_color: selectedSubscription.price_color || 'text-blue-600',
          icon: selectedSubscription.icon || 'monitor',
          pix_qr_code: selectedSubscription.pix_qr_code
        });

      if (insertError) throw insertError;

      // Then update pending subscription status
      const { error: updateError } = await supabase
        .from('pending_subscriptions')
        .update({
          status_approval: 'approved',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', selectedSubscription.id);

      if (updateError) throw updateError;

      setPendingSubscriptions(prevSubs => 
        prevSubs.map(sub => 
          sub.id === selectedSubscription.id 
            ? { ...sub, status_approval: 'approved' } 
            : sub
        )
      );

      toast({
        title: "Anúncio aprovado",
        description: "O anúncio foi aprovado e publicado com sucesso.",
      });

      setApproveDialogOpen(false);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro ao aprovar anúncio",
        description: err.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredSubscriptions = searchTerm
    ? pendingSubscriptions.filter(sub => 
        sub.title.toLowerCase().includes(searchTerm) || 
        sub.telegram_username.toLowerCase().includes(searchTerm) ||
        (sub.username && sub.username.toLowerCase().includes(searchTerm))
      )
    : pendingSubscriptions;

  return (
    <div className="max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Anúncios Pendentes</h1>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md flex items-center gap-3 mb-6">
          <AlertTriangle className="text-red-500" />
          <span className="text-red-600">{error}</span>
        </div>
      )}
      
      <div className="mb-6">
        <Input
          placeholder="Pesquisar anúncios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>
      
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Título</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead className="hidden md:table-cell">Usuário</TableHead>
              <TableHead className="hidden lg:table-cell">Telegram</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="mt-2 text-muted-foreground">Carregando anúncios pendentes...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredSubscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {searchTerm ? "Nenhum resultado encontrado" : "Nenhum anúncio pendente"}
                </TableCell>
              </TableRow>
            ) : (
              filteredSubscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell className="font-medium">
                    {subscription.title}
                  </TableCell>
                  <TableCell>{subscription.price}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {subscription.username || 'Usuário'}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {subscription.telegram_username}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className={`px-2 py-1 rounded text-xs ${
                      subscription.status_approval === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      subscription.status_approval === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {subscription.status_approval === 'pending' ? 'Pendente' :
                       subscription.status_approval === 'approved' ? 'Aprovado' : 'Rejeitado'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {subscription.status_approval === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenApproveDialog(subscription)}
                            className="text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenRejectDialog(subscription)}
                            className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/subscriptions/edit/${subscription.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {subscription.status_approval === 'rejected' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSubscription(subscription);
                            setRejectionReason(subscription.rejection_reason || '');
                            setRejectDialogOpen(true);
                          }}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          Ver motivo
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

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Anúncio</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição do anúncio. O usuário será notificado.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explique o motivo da rejeição..."
              className="min-h-[100px]"
              disabled={selectedSubscription?.status_approval === 'rejected'}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            {selectedSubscription?.status_approval !== 'rejected' && (
              <Button 
                onClick={handleReject} 
                disabled={isProcessing || rejectionReason.trim() === ''}
                className="bg-red-600 hover:bg-red-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : 'Rejeitar Anúncio'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aprovar Anúncio</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja aprovar este anúncio? Ele será publicado no site imediatamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aprovando...
                </>
              ) : 'Aprovar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PendingSubscriptions;
