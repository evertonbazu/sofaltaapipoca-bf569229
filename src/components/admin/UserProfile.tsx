
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from 'react-router-dom';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const UserProfile: React.FC = () => {
  const { toast } = useToast();
  const { authState } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [userSubscriptions, setUserSubscriptions] = useState<any[]>([]);
  const [pendingSubscriptions, setPendingSubscriptions] = useState<any[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!authState.session?.user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Get user profile from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authState.session.user.id)
          .single();
        
        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          setError("Não foi possível obter seus dados de perfil.");
          return;
        }
        
        if (profileData) {
          setUsername(profileData.username || '');
          // Use email from profiles table
          setEmail(profileData.email || '');
        }
        
        // Set email from the session as a fallback
        if (!profileData?.email && authState.session?.user) {
          setEmail(authState.session.user.email || '');
        }

        // Fetch user subscriptions
        const { data: subscriptionsData, error: subscriptionsError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', authState.session.user.id)
          .order('added_date', { ascending: false });
        
        if (subscriptionsError) {
          console.error("Error fetching user subscriptions:", subscriptionsError);
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Não foi possível carregar seus anúncios."
          });
        } else {
          setUserSubscriptions(subscriptionsData || []);
        }

        // Fetch pending subscriptions
        const { data: pendingData, error: pendingError } = await supabase
          .from('pending_subscriptions')
          .select('*')
          .eq('user_id', authState.session.user.id)
          .order('submitted_at', { ascending: false });
        
        if (pendingError) {
          console.error("Error fetching pending subscriptions:", pendingError);
        } else {
          setPendingSubscriptions(pendingData || []);
        }
      } catch (err: any) {
        console.error("Error in fetchUserProfile:", err);
        setError(err.message || "Ocorreu um erro ao carregar seu perfil.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [authState.session, authState.user, toast]);

  const handleUpdateProfile = async () => {
    if (!authState.session?.user?.id) return;
    
    try {
      setIsSaving(true);
      setError(null);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          email // Also update email in the profiles table
        })
        .eq('id', authState.session.user.id);
      
      if (error) throw error;
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso."
      });
      
    } catch (err: any) {
      setError(err.message || "Não foi possível atualizar seu perfil.");
      toast({
        variant: "destructive",
        title: "Erro ao atualizar perfil",
        description: err.message || "Não foi possível atualizar seu perfil."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSubscription = (subscription: any) => {
    setSubscriptionToDelete(subscription);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteSubscription = async () => {
    if (!subscriptionToDelete) return;
    
    setIsDeleting(true);
    
    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', subscriptionToDelete.id);
        
      if (error) throw error;
      
      setUserSubscriptions(userSubscriptions.filter(sub => sub.id !== subscriptionToDelete.id));
      
      toast({
        title: "Anúncio excluído",
        description: "Seu anúncio foi excluído com sucesso."
      });
      
      setDeleteDialogOpen(false);
    } catch (err: any) {
      console.error("Error deleting subscription:", err);
      toast({
        variant: "destructive",
        title: "Erro ao excluir anúncio",
        description: err.message || "Não foi possível excluir o anúncio."
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle page back navigation
  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="mt-2 text-muted-foreground">Carregando perfil...</span>
      </div>
    );
  }

  const getStatusText = (status: string) => {
    switch(status) {
      case 'pending': return 'Pendente';
      case 'approved': return 'Aprovado';
      case 'rejected': return 'Rejeitado';
      default: return status;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Meu Perfil</h1>
        <Button 
          variant="outline" 
          onClick={handleBack}
        >
          Voltar
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="space-y-6">
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Nome de Usuário</Label>
              <Input 
                id="username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className="w-full"
                placeholder="Seu nome de usuário"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                disabled 
                className="w-full bg-gray-100"
              />
              <p className="text-xs text-muted-foreground">O email não pode ser alterado.</p>
            </div>
            
            <Button 
              onClick={handleUpdateProfile} 
              disabled={isSaving} 
              className="w-full"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Meus Anúncios</CardTitle>
            </CardHeader>
            <CardContent>
              {userSubscriptions.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">
                  Você ainda não possui anúncios publicados.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead>Ação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userSubscriptions.map((subscription) => (
                        <TableRow key={subscription.id}>
                          <TableCell className="font-medium">{subscription.title}</TableCell>
                          <TableCell>{subscription.price}</TableCell>
                          <TableCell>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleDeleteSubscription(subscription)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {pendingSubscriptions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Anúncios Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Título</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingSubscriptions.map((subscription) => (
                        <TableRow key={subscription.id}>
                          <TableCell className="font-medium">{subscription.title}</TableCell>
                          <TableCell>{subscription.price}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs ${
                              subscription.status_approval === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              subscription.status_approval === 'approved' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {getStatusText(subscription.status_approval)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir anúncio</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteSubscription}
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

export default UserProfile;
