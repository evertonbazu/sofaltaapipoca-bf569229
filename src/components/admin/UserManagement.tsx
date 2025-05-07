
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Pencil, Trash2, Search, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ProfileFromSupabase } from '@/types/subscriptionTypes';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<ProfileFromSupabase[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // Edit user state
  const [editingUser, setEditingUser] = useState<ProfileFromSupabase | null>(null);
  const [editUsername, setEditUsername] = useState<string>('');
  const [editRole, setEditRole] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  // Delete user state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<ProfileFromSupabase | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  
  const { toast } = useToast();
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setUsers(data || []);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Erro ao carregar usuários",
        description: err.message || "Não foi possível carregar a lista de usuários."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditUser = (user: ProfileFromSupabase) => {
    setEditingUser(user);
    setEditUsername(user.username || '');
    setEditRole(user.role || 'user');
    setIsEditing(false);
  };
  
  const handleSaveEdit = async () => {
    if (!editingUser) return;
    
    try {
      setIsEditing(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          username: editUsername,
          role: editRole
        })
        .eq('id', editingUser.id);
      
      if (error) throw error;
      
      toast({
        title: "Usuário atualizado",
        description: "As informações do usuário foram atualizadas com sucesso."
      });
      
      // Update local state
      setUsers(users.map(user => 
        user.id === editingUser.id 
          ? { ...user, username: editUsername, role: editRole } 
          : user
      ));
      
      setEditingUser(null);
    } catch (err: any) {
      console.error('Error updating user:', err);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar usuário",
        description: err.message || "Não foi possível atualizar as informações do usuário."
      });
    } finally {
      setIsEditing(false);
    }
  };
  
  const handleDeleteClick = (user: ProfileFromSupabase) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    
    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userToDelete.id);
      
      if (error) throw error;
      
      toast({
        title: "Usuário excluído",
        description: "O usuário foi excluído com sucesso."
      });
      
      // Update local state
      setUsers(users.filter(user => user.id !== userToDelete.id));
      
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (err: any) {
      console.error('Error deleting user:', err);
      toast({
        variant: "destructive",
        title: "Erro ao excluir usuário",
        description: err.message || "Não foi possível excluir o usuário. Note que usuários com dados associados não podem ser excluídos."
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (user.username?.toLowerCase().includes(searchLower) || '') ||
      (user.email?.toLowerCase().includes(searchLower) || '') ||
      (user.role?.toLowerCase().includes(searchLower) || '')
    );
  });
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
          <p className="text-muted-foreground">Gerencie os usuários cadastrados na plataforma</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Lista de Usuários
          </CardTitle>
          <CardDescription>
            Visualize e gerencie todos os usuários cadastrados na plataforma.
          </CardDescription>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              className="pl-10"
              placeholder="Buscar por nome, email ou função..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-600">
              {error}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "Nenhum usuário encontrado com essa busca." : "Nenhum usuário cadastrado."}
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Data de Cadastro</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username || 'Sem nome'}</TableCell>
                      <TableCell>{user.email || 'N/A'}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditUser(user)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Editar Usuário</DialogTitle>
                                <DialogDescription>
                                  Edite as informações do usuário abaixo.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="username" className="text-right">
                                    Nome
                                  </Label>
                                  <Input
                                    id="username"
                                    value={editUsername}
                                    onChange={(e) => setEditUsername(e.target.value)}
                                    className="col-span-3"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="email" className="text-right">
                                    Email
                                  </Label>
                                  <Input
                                    id="email"
                                    value={editingUser?.email || ''}
                                    disabled
                                    className="col-span-3 bg-gray-50"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="role" className="text-right">
                                    Função
                                  </Label>
                                  <Select
                                    value={editRole}
                                    onValueChange={setEditRole}
                                  >
                                    <SelectTrigger className="col-span-3">
                                      <SelectValue placeholder="Selecione uma função" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="user">Usuário</SelectItem>
                                      <SelectItem value="admin">Administrador</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant="outline">Cancelar</Button>
                                </DialogClose>
                                <Button 
                                  onClick={handleSaveEdit} 
                                  disabled={isEditing}
                                >
                                  {isEditing ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Salvando...
                                    </>
                                  ) : 'Salvar'}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-red-50 border-red-200 hover:bg-red-100"
                            onClick={() => handleDeleteClick(user)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Total: {filteredUsers.length} usuário(s)
          </div>
          <Button
            variant="outline"
            onClick={fetchUsers}
            disabled={isLoading}
          >
            {isLoading ? (
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
              Essa ação não pode ser desfeita. Isso excluirá permanentemente o usuário{' '}
              <span className="font-bold">{userToDelete?.username || userToDelete?.email || 'sem nome'}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
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

export default UserManagement;
