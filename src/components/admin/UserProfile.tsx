
// This file needs to be implemented from scratch since we don't see its content in the current code
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, Trash2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const UserProfile = () => {
  const { authState, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [pendingSubscriptions, setPendingSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  useEffect(() => {
    if (authState.user?.id) {
      fetchUserSubscriptions();
    }
  }, [authState.user]);

  const fetchUserSubscriptions = async () => {
    setIsLoading(true);
    try {
      // Fetch approved subscriptions
      const { data: approvedSubs, error: approvedError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', authState.user.id);

      if (approvedError) throw approvedError;

      // Fetch pending subscriptions
      const { data: pendingSubs, error: pendingError } = await supabase
        .from('pending_subscriptions')
        .select('*')
        .eq('user_id', authState.user.id);

      if (pendingError) throw pendingError;

      // Sort by added_date, newest first
      const sortedApproved = approvedSubs?.sort((a, b) => 
        new Date(b.added_date || 0) - new Date(a.added_date || 0)
      ) || [];
      
      const sortedPending = pendingSubs?.sort((a, b) => 
        new Date(b.added_date || 0) - new Date(a.added_date || 0)
      ) || [];

      setUserSubscriptions(sortedApproved);
      setPendingSubscriptions(sortedPending);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar anúncios",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSubscription = async (subscription, isPending = false) => {
    try {
      const table = isPending ? 'pending_subscriptions' : 'subscriptions';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', subscription.id);

      if (error) throw error;

      toast({
        title: "Anúncio excluído",
        description: "O anúncio foi excluído com sucesso."
      });

      // Refresh the lists
      fetchUserSubscriptions();
    } catch (error) {
      console.error("Error deleting subscription:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir anúncio",
        description: error.message
      });
    }
  };

  const handleDeleteClick = (subscription, isPending) => {
    setSelectedSubscription({ data: subscription, isPending });
    setOpenDialog(true);
  };

  if (!authState.user) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <div className="container mx-auto px-4 py-8 flex-1">
          <Card className="p-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <AlertCircle className="h-12 w-12 text-yellow-500" />
              <h1 className="text-2xl font-bold">Acesso não autorizado</h1>
              <p className="text-gray-600">Você precisa estar logado para acessar esta página.</p>
              <Button onClick={() => navigate('/auth')}>Fazer Login</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-between items-center">
            <Button 
              variant="ghost" 
              className="font-medium"
              onClick={() => navigate('/')}
            >
              <Home className="h-4 w-4 mr-2" /> 
              Início
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card className="mb-6 p-6">
          <h1 className="text-2xl font-bold mb-4">Meu Perfil</h1>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{authState.user.email || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Nome de usuário</p>
              <p className="font-medium">{authState.user.username || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Função</p>
              <p className="font-medium">{authState.user.role === 'admin' ? 'Administrador' : 'Usuário'}</p>
            </div>
          </div>
        </Card>

        <Card className="mb-6 p-6">
          <h2 className="text-xl font-bold mb-4">Meus Anúncios</h2>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {userSubscriptions.length === 0 && pendingSubscriptions.length === 0 ? (
                <div className="text-center py-6 border rounded-md bg-gray-50">
                  <p className="text-gray-500">Você ainda não possui anúncios cadastrados.</p>
                  <Button 
                    variant="link"
                    onClick={() => navigate('/new')}
                    className="mt-2"
                  >
                    Cadastrar novo anúncio
                  </Button>
                </div>
              ) : (
                <>
                  {userSubscriptions.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-medium text-gray-700 mb-3">Anúncios aprovados</h3>
                      <div className="space-y-3">
                        {userSubscriptions.map(subscription => (
                          <div 
                            key={subscription.id}
                            className="p-3 border rounded-md flex justify-between items-center"
                          >
                            <div>
                              <div className="font-medium">{subscription.title}</div>
                              <div className="text-sm text-gray-500">
                                {subscription.price} - {new Date(subscription.added_date).toLocaleDateString()}
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteClick(subscription, false)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {pendingSubscriptions.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-700 mb-3">Anúncios pendentes</h3>
                      <div className="space-y-3">
                        {pendingSubscriptions.map(subscription => (
                          <div 
                            key={subscription.id}
                            className="p-3 border rounded-md flex justify-between items-center"
                          >
                            <div>
                              <div className="font-medium">{subscription.title}</div>
                              <div className="text-sm text-gray-500">
                                {subscription.price} - {subscription.status_approval} - {new Date(subscription.added_date).toLocaleDateString()}
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteClick(subscription, true)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </Card>

        <div className="text-center">
          <Button onClick={() => navigate('/')}>Voltar à página inicial</Button>
        </div>

        <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setOpenDialog(false)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => {
                  if (selectedSubscription) {
                    deleteSubscription(selectedSubscription.data, selectedSubscription.isPending);
                    setOpenDialog(false);
                  }
                }}
                className="bg-red-500 hover:bg-red-600"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default UserProfile;
