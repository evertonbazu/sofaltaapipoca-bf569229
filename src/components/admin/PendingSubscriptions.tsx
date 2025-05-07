
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
import { Loader2, AlertTriangle, Check, X, Edit, ArrowUpDown } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  pix_key?: string;
  payment_proof_image?: string;
  código?: number;
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
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortBy, setSortBy] = useState<string>('status_approval');

  useEffect(() => {
    fetchPendingSubscriptions();
  }, [sortBy, sortOrder]);

  const fetchPendingSubscriptions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all profiles for user mapping
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username');
      
      if (profilesError) throw profilesError;
      
      // Convert profiles to a map for easier lookup
      const profilesMap = new Map<string, string>();
      profiles.forEach((profile: Profile) => {
        profilesMap.set(profile.id, profile.username || 'Sem nome');
      });

      // Fetch pending subscriptions
      let query = supabase
        .from('pending_subscriptions')
        .select('*');
      
      // If sorting by status_approval, use a special order to put pending first
      if (sortBy === 'status_approval') {
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Add usernames to the data
        const pendingWithUsernames = data.map((sub: any) => ({
          ...sub,
          username: profilesMap.get(sub.user_id) || 'Sem nome',
        }));
        
        // Sort the data manually to put pending first
        const statusOrder = sortOrder === 'asc' 
          ? { 'pending': 0, 'approved': 1, 'rejected': 2 }
          : { 'pending': 2, 'approved': 1, 'rejected': 0 };
          
        pendingWithUsernames.sort((a: PendingSubscription, b: PendingSubscription) => {
          const statusA = statusOrder[a.status_approval as keyof typeof statusOrder] || 3;
          const statusB = statusOrder[b.status_approval as keyof typeof statusOrder] || 3;
          return statusA - statusB;
        });
        
        setPendingSubscriptions(pendingWithUsernames);
      } else {
        // Apply regular sorting for other fields
        const { data, error } = await query.order(sortBy, { ascending: sortOrder === 'asc' });
        
        if (error) throw error;
        
        // Add usernames to the data
        const pendingWithUsernames = data.map((sub: any) => ({
          ...sub,
          username: profilesMap.get(sub.user_id) || 'Sem nome',
        }));
        
        setPendingSubscriptions(pendingWithUsernames);
      }
    } catch (err: any) {
      console.error("Error fetching pending subscriptions:", err);
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

  const handleToggleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
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
      console.error("Error rejecting subscription:", err);
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

      const subscription = { ...selectedSubscription };
      
      // Remove fields that shouldn't be in the subscriptions table
      delete subscription.status_approval;
      delete subscription.rejection_reason;
      delete subscription.username;

      // First add to subscriptions table
      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert({
          title: subscription.title,
          price: subscription.price,
          payment_method: subscription.payment_method,
          status: subscription.status,
          access: subscription.access,
          whatsapp_number: subscription.whatsapp_number,
          telegram_username: subscription.telegram_username,
          added_date: subscription.added_date,
          header_color: subscription.header_color || 'bg-blue-600',
          price_color: subscription.price_color || 'text-blue-600',
          icon: subscription.icon || 'monitor',
          pix_qr_code: subscription.pix_qr_code,
          pix_key: subscription.pix_key,
          payment_proof_image: subscription.payment_proof_image,
          user_id: subscription.user_id, // Ensure we keep the original user_id
          código: subscription.código
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
      console.error("Error approving subscription:", err);
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
        sub.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        sub.telegram_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sub.username && sub.username.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : pendingSubscriptions;

  return (
    <div className="max-w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Anúncios Pendentes</h1>
        <Button onClick={fetchPendingSubscriptions} variant="outline" className="flex items-center gap-2">
          <Loader2 className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md flex items-center gap-3 mb-6">
          <AlertTriangle className="text-red-500" />
          <span className="text-red-600">{error}</span>
        </div>
      )}
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Input
          placeholder="Pesquisar anúncios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        
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
            <SelectItem value="status_approval-asc">Status (Pendentes primeiro)</SelectItem>
            <SelectItem value="status_approval-desc">Status (Rejeitados primeiro)</SelectItem>
            <SelectItem value="title-asc">Título (A-Z)</SelectItem>
            <SelectItem value="title-desc">Título (Z-A)</SelectItem>
            <SelectItem value="price-asc">Preço (Menor primeiro)</SelectItem>
            <SelectItem value="price-desc">Preço (Maior primeiro)</SelectItem>
            <SelectItem value="telegram_username-asc">Telegram (A-Z)</SelectItem>
            <SelectItem value="telegram_username-desc">Telegram (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
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
              <TableHead>
                <div className="flex items-center">
                  Preço
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-1 p-0" 
                    onClick={() => handleToggleSort('price')}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>
              </TableHead>
              <TableHead className="hidden md:table-cell">
                <div className="flex items-center">
                  Usuário
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-1 p-0" 
                    onClick={() => handleToggleSort('username')}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                <div className="flex items-center">
                  Telegram
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-1 p-0" 
                    onClick={() => handleToggleSort('telegram_username')}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>
              </TableHead>
              <TableHead className="hidden sm:table-cell">
                <div className="flex items-center">
                  Status
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-1 p-0" 
                    onClick={() => handleToggleSort('status_approval')}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>
              </TableHead>
              <TableHead className="hidden xl:table-cell">Código</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="mt-2 text-muted-foreground">Carregando anúncios pendentes...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredSubscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
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
                  <TableCell className="hidden xl:table-cell">
                    {subscription.código || '-'}
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
