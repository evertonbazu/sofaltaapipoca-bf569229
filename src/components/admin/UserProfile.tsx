
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Home, Trash2, AlertCircle, Save, User, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APP_VERSION } from '@/App';
import { UserProfile as UserProfileType } from '@/types/authTypes';

const UserProfile = () => {
  const { authState, updateProfile, updatePassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [pendingSubscriptions, setPendingSubscriptions] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  
  // Profile edit state
  const [editMode, setEditMode] = useState(false);
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Password change state
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (authState.user?.id) {
      fetchUserData();
      if (authState.user?.username) {
        setUsername(authState.user.username || '');
      }
    }
  }, [authState.user]);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchUserSubscriptions(),
        fetchUserMessages()
      ]);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserSubscriptions = async () => {
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
      const sortedApproved = approvedSubs?.sort((a, b) => {
        // Convert to Date objects for comparison
        const dateA = a.added_date ? new Date(a.added_date) : new Date(0);
        const dateB = b.added_date ? new Date(b.added_date) : new Date(0);
        
        // Compare timestamps (in milliseconds)
        return dateB.getTime() - dateA.getTime();
      }) || [];
      
      const sortedPending = pendingSubs?.sort((a, b) => {
        // Convert to Date objects for comparison
        const dateA = a.added_date ? new Date(a.added_date) : new Date(0);
        const dateB = b.added_date ? new Date(b.added_date) : new Date(0);
        
        // Compare timestamps (in milliseconds)
        return dateB.getTime() - dateA.getTime();
      }) || [];

      setUserSubscriptions(sortedApproved);
      setPendingSubscriptions(sortedPending);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    }
  };

  const fetchUserMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .eq('user_id', authState.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setContactMessages(data || []);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
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

  const handleSaveProfile = async () => {
    if (!username.trim()) {
      toast({
        variant: "destructive",
        title: "Nome de usuário inválido",
        description: "Por favor, digite um nome de usuário válido."
      });
      return;
    }
    
    setSaving(true);
    try {
      const result = await updateProfile({ username });
      
      if (result.success) {
        toast({
          title: "Perfil atualizado",
          description: "Seu nome de usuário foi atualizado com sucesso."
        });
        setEditMode(false);
      } else {
        throw new Error(result.message || "Erro ao atualizar perfil");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar perfil",
        description: error.message
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword) {
      toast({
        variant: "destructive",
        title: "Senha inválida",
        description: "Por favor, digite uma senha válida."
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Senhas não coincidem",
        description: "A senha de confirmação não coincide com a nova senha."
      });
      return;
    }
    
    setChangingPassword(true);
    try {
      const result = await updatePassword({ password: newPassword });
      
      if (result.success) {
        toast({
          title: "Senha atualizada",
          description: "Sua senha foi alterada com sucesso."
        });
        setChangePasswordOpen(false);
        setNewPassword('');
        setConfirmPassword('');
      } else {
        throw new Error(result.message || "Erro ao atualizar senha");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar senha",
        description: error.message
      });
    } finally {
      setChangingPassword(false);
    }
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
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full md:w-auto mb-6">
            <TabsTrigger value="profile" className="flex-1 md:flex-none"><User className="h-4 w-4 mr-2" /> Perfil</TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex-1 md:flex-none">Anúncios</TabsTrigger>
            <TabsTrigger value="messages" className="flex-1 md:flex-none"><MessageSquare className="h-4 w-4 mr-2" /> Mensagens</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Dados do Perfil</span>
                  {!editMode && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setEditMode(true)}
                    >
                      Editar
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {editMode ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome de usuário
                      </label>
                      <Input 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Seu nome de usuário"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setEditMode(false);
                          setUsername(authState.user.username || '');
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="flex items-center gap-1"
                      >
                        {saving ? 'Salvando...' : (
                          <>
                            <Save className="h-4 w-4" /> Salvar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
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
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Segurança</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline"
                  onClick={() => setChangePasswordOpen(true)}
                >
                  Alterar Senha
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="subscriptions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Meus Anúncios</CardTitle>
              </CardHeader>
              <CardContent>
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
                                  className="p-3 border rounded-md flex justify-between items-center flex-wrap gap-2"
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="font-medium truncate">{subscription.title}</div>
                                    <div className="text-sm text-gray-500">
                                      {subscription.price} - {subscription.added_date 
                                        ? new Date(subscription.added_date).toLocaleDateString() 
                                        : 'N/A'}
                                    </div>
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleDeleteClick(subscription, false)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 whitespace-nowrap"
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" /> Excluir
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
                                  className="p-3 border rounded-md flex justify-between items-center flex-wrap gap-2"
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="font-medium truncate">{subscription.title}</div>
                                    <div className="text-sm text-gray-500 flex flex-wrap gap-1">
                                      <span>{subscription.price}</span>
                                      <span className={
                                        subscription.status_approval === 'pending'
                                          ? 'bg-yellow-100 text-yellow-800 px-1 rounded-sm text-xs font-medium'
                                          : subscription.status_approval === 'approved'
                                            ? 'bg-green-100 text-green-800 px-1 rounded-sm text-xs font-medium'
                                            : 'bg-red-100 text-red-800 px-1 rounded-sm text-xs font-medium'
                                      }>
                                        {subscription.status_approval === 'pending'
                                          ? 'Pendente'
                                          : subscription.status_approval === 'approved'
                                            ? 'Aprovado'
                                            : 'Rejeitado'}
                                      </span>
                                      <span>{subscription.added_date 
                                        ? new Date(subscription.added_date).toLocaleDateString() 
                                        : 'N/A'}</span>
                                    </div>
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleDeleteClick(subscription, true)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 whitespace-nowrap"
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" /> Excluir
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
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Minhas Mensagens de Contato</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <>
                    {contactMessages.length === 0 ? (
                      <div className="text-center py-6 border rounded-md bg-gray-50">
                        <p className="text-gray-500">Você ainda não enviou nenhuma mensagem de contato.</p>
                        <Button 
                          variant="link"
                          onClick={() => navigate('/contact')}
                          className="mt-2"
                        >
                          Ir para página de contato
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {contactMessages.map(message => (
                          <div 
                            key={message.id}
                            className="p-3 border rounded-md"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium">{message.subject}</h4>
                              <span className="text-xs text-gray-500">
                                {message.created_at 
                                  ? new Date(message.created_at).toLocaleDateString() 
                                  : 'N/A'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 line-clamp-3">
                              {message.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center mt-6">
          <Button onClick={() => navigate('/')}>Voltar à página inicial</Button>
        </div>

        <p className="text-center text-xs text-gray-500 mt-8">
          &copy; {new Date().getFullYear()} Só Falta a Pipoca - versão {APP_VERSION}
        </p>

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
        
        {/* Change Password Dialog */}
        <Dialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Alterar Senha</DialogTitle>
              <DialogDescription>
                Digite sua nova senha abaixo.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nova Senha</label>
                <Input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite sua nova senha"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirmar Nova Senha</label>
                <Input 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua nova senha"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setChangePasswordOpen(false);
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleChangePassword}
                disabled={changingPassword}
              >
                {changingPassword ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default UserProfile;
