
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Search, Loader2, ArrowUpDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SubscriptionFromSupabase } from '@/types/subscriptionTypes';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { supabase } from '@/integrations/supabase/client';

const SubscriptionList: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionFromSupabase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortColumn, setSortColumn] = useState<keyof SubscriptionFromSupabase>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [subscriptionIdToDelete, setSubscriptionIdToDelete] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriptions();
  }, [sortColumn, sortDirection]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('subscriptions')
        .select('*');
        
      // Handle sorting
      query = query.order(sortColumn, { ascending: sortDirection === 'asc' });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching subscriptions:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar anúncios",
          description: error.message || "Não foi possível carregar a lista de anúncios."
        });
      } else {
        setSubscriptions(data || []);
      }
    } catch (error: any) {
      console.error('Error fetching subscriptions:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar anúncios",
        description: "Ocorreu um erro ao carregar a lista de anúncios."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = (column: keyof SubscriptionFromSupabase) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleEditClick = (id: string) => {
    navigate(`/admin/subscriptions/edit/${id}`);
  };

  const handleDeleteClick = (id: string) => {
    setSubscriptionIdToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteSubscription = async () => {
    if (!subscriptionIdToDelete) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', subscriptionIdToDelete);

      if (error) {
        console.error('Error deleting subscription:', error);
        toast({
          variant: "destructive",
          title: "Erro ao excluir anúncio",
          description: error.message || "Não foi possível excluir o anúncio."
        });
      } else {
        toast({
          title: "Anúncio excluído",
          description: "O anúncio foi excluído com sucesso."
        });
        fetchSubscriptions();
      }
    } catch (error: any) {
      console.error('Error deleting subscription:', error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir anúncio",
        description: "Ocorreu um erro ao excluir o anúncio."
      });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setSubscriptionIdToDelete(null);
    }
  };

  const filteredSubscriptions = subscriptions.filter(subscription =>
    subscription.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderSortIcon = (column: keyof SubscriptionFromSupabase) => {
    if (column === sortColumn) {
      return <ArrowUpDown className="h-4 w-4 ml-1" />;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lista de Anúncios</h1>
          <p className="text-muted-foreground">Visualize e gerencie os anúncios cadastrados</p>
        </div>
        <Button onClick={() => navigate('/admin/subscriptions/new')}>Novo Anúncio</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Anúncios Cadastrados</CardTitle>
          <CardDescription>
            Visualize, edite e exclua os anúncios cadastrados na plataforma.
          </CardDescription>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              className="pl-10"
              placeholder="Buscar por título..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]" onClick={() => handleSortChange('title')}>
                    <div className="flex items-center">
                      Título
                      {renderSortIcon('title')}
                    </div>
                  </TableHead>
                  <TableHead onClick={() => handleSortChange('price')}>
                    <div className="flex items-center">
                      Preço
                      {renderSortIcon('price')}
                    </div>
                  </TableHead>
                  <TableHead className="hidden md:table-cell" onClick={() => handleSortChange('status')}>
                    <div className="flex items-center">
                      Status
                      {renderSortIcon('status')}
                    </div>
                  </TableHead>
                  <TableHead className="hidden md:table-cell" onClick={() => handleSortChange('telegram_username')}>
                    <div className="flex items-center">
                      Telegram
                      {renderSortIcon('telegram_username')}
                    </div>
                  </TableHead>
                  <TableHead className="hidden lg:table-cell" onClick={() => handleSortChange('whatsapp_number')}>
                    <div className="flex items-center">
                      WhatsApp
                      {renderSortIcon('whatsapp_number')}
                    </div>
                  </TableHead>
                  <TableHead className="hidden lg:table-cell" onClick={() => handleSortChange('added_date')}>
                    <div className="flex items-center">
                      Data
                      {renderSortIcon('added_date')}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <span className="mt-2 text-muted-foreground">Carregando anúncios...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredSubscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      {searchTerm ? (
                        <div className="text-muted-foreground">Nenhum resultado encontrado para "{searchTerm}"</div>
                      ) : (
                        <div className="text-muted-foreground">Nenhum anúncio cadastrado</div>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell className="font-medium">{subscription.title}</TableCell>
                      <TableCell>{subscription.price}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            getStatusColor(subscription.status)
                          }`}
                        >
                          {subscription.status}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {subscription.telegram_username}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {subscription.whatsapp_number}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {subscription.added_date ? new Date(subscription.added_date).toLocaleDateString('pt-BR') : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(subscription.id)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-red-50 border-red-200 hover:bg-red-100"
                            onClick={() => handleDeleteClick(subscription.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
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
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Total: {subscriptions.length} anúncio(s)
          </div>
          <Button
            variant="outline"
            onClick={fetchSubscriptions}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Carregando...
              </>
            ) : 'Atualizar Lista'}
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente o anúncio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteSubscription}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? (
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
