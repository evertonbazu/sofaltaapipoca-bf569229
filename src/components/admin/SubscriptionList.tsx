
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Edit, Trash2, AlertTriangle, Loader2, Plus } from 'lucide-react';
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

const SubscriptionList: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

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
          addedDate: item.added_date
        }));
        
        setSubscriptions(formattedData);
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

  const filteredSubscriptions = searchTerm
    ? subscriptions.filter(sub => 
        sub.title.toLowerCase().includes(searchTerm) || 
        sub.paymentMethod.toLowerCase().includes(searchTerm) ||
        sub.telegramUsername.toLowerCase().includes(searchTerm) ||
        sub.addedDate?.toLowerCase().includes(searchTerm)
      )
    : subscriptions;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Anúncios</h1>
        <Button 
          onClick={() => navigate('/admin/subscriptions/new')} 
          className="flex gap-2"
        >
          <Plus className="h-5 w-5" />
          Novo Anúncio
        </Button>
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
          onChange={handleSearch}
          className="max-w-md"
        />
      </div>
      
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Título</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="hidden lg:table-cell">Data</TableHead>
              <TableHead className="hidden md:table-cell">Telegram</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="mt-2 text-muted-foreground">Carregando anúncios...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredSubscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {searchTerm ? "Nenhum resultado encontrado" : "Nenhum anúncio cadastrado"}
                </TableCell>
              </TableRow>
            ) : (
              filteredSubscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => confirmDelete(subscription.id || '')}
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
