
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  AlertTriangle, 
  Loader2, 
  UserPlus, 
  Edit, 
  Trash2 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
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
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: string;
  email?: string;
  username?: string;
  role: string;
  created_at?: string;
}

const UserManagement: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    username: '',
    role: 'member'
  });
  
  const [editUser, setEditUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // First get all auth users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;

      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      // Combine auth users with profiles
      const combinedUsers = profiles.map((profile: any) => {
        const authUser = authUsers?.users?.find(user => user.id === profile.id);
        return {
          id: profile.id,
          email: authUser?.email || '',
          username: profile.username || '',
          role: profile.role || 'member',
          created_at: profile.created_at || authUser?.created_at || ''
        };
      });
      
      setUsers(combinedUsers);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      
      // Fallback to just using profiles if auth.admin.listUsers fails
      // This is more likely to happen since most users won't have admin API access
      try {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*');
  
        if (profilesError) throw profilesError;
  
        if (!profiles || profiles.length === 0) {
          setUsers([]);
          setIsLoading(false);
          return;
        }
  
        // Map profiles to user objects
        const usersWithProfiles = profiles.map((profile: any) => {
          return {
            id: profile.id,
            email: '', // We might not have this without auth API
            username: profile.username || '',
            role: profile.role || 'member',
            created_at: profile.created_at || ''
          };
        });
        
        setUsers(usersWithProfiles);
      } catch (fallbackError: any) {
        setError(fallbackError.message);
        toast({
          variant: "destructive",
          title: "Erro ao carregar usuários",
          description: fallbackError.message
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleAddUser = async () => {
    try {
      // Create user with Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            username: newUser.username
          }
        }
      });

      if (authError) throw authError;

      // Update the role if needed
      if (data.user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: newUser.role })
          .eq('id', data.user.id);
        
        if (updateError) throw updateError;
      }
      
      toast({
        title: "Usuário adicionado",
        description: `O usuário ${newUser.email} foi adicionado com sucesso.`
      });
      
      setIsAddDialogOpen(false);
      setNewUser({
        email: '',
        password: '',
        username: '',
        role: 'member'
      });
      
      // Reload users
      fetchUsers();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar usuário",
        description: err.message
      });
    }
  };

  const handleOpenEdit = (user: User) => {
    setEditUser(user);
    setIsEditDialogOpen(true);
  };

  const handleEditUser = async () => {
    if (!editUser) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: editUser.username,
          role: editUser.role
        })
        .eq('id', editUser.id);
      
      if (error) throw error;
      
      toast({
        title: "Usuário atualizado",
        description: `O usuário ${editUser.username || editUser.email} foi atualizado com sucesso.`
      });
      
      setIsEditDialogOpen(false);
      setEditUser(null);
      
      // Reload users
      fetchUsers();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar usuário",
        description: err.message
      });
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteUserId(id);
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    
    try {
      setIsDeleting(true);
      
      // Delete from profiles table first
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', deleteUserId);
      
      if (profileError) throw profileError;
      
      // Try to delete the user from auth if available
      try {
        await supabase.auth.admin.deleteUser(deleteUserId);
      } catch (err) {
        console.log("Admin API not available in current environment");
      }
      
      setUsers(users.filter(user => user.id !== deleteUserId));
      
      toast({
        title: "Usuário excluído",
        description: "O usuário foi excluído com sucesso."
      });
      
      setDeleteUserId(null);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir usuário",
        description: err.message
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = users.filter(user =>
    (user.email?.toLowerCase() || '').includes(searchTerm) ||
    (user.username?.toLowerCase() || '').includes(searchTerm) ||
    user.role.toLowerCase().includes(searchTerm)
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Gerenciar Usuários</h1>
        <Button 
          onClick={() => setIsAddDialogOpen(true)} 
          className="flex gap-2"
        >
          <UserPlus className="h-5 w-5" />
          Novo Usuário
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
          placeholder="Pesquisar usuários..."
          value={searchTerm}
          onChange={handleSearch}
          className="max-w-md"
        />
      </div>
      
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Nome de Usuário</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
              <TableHead>Função</TableHead>
              <TableHead className="hidden md:table-cell">Data de Criação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="mt-2 text-muted-foreground">Carregando usuários...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {searchTerm ? "Nenhum resultado encontrado" : "Nenhum usuário cadastrado"}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.username || 'Sem nome de usuário'}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role === 'admin' ? 'Administrador' : 'Membro'}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : ''}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => confirmDelete(user.id)}
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

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Usuário</DialogTitle>
            <DialogDescription>
              Adicione informações para criar um novo usuário.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                placeholder="usuario@exemplo.com" 
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input 
                id="password" 
                type="password" 
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                placeholder="••••••••" 
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="username">Nome de Usuário</Label>
              <Input 
                id="username" 
                value={newUser.username}
                onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                placeholder="nomedeusuario" 
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="role">Função</Label>
              <Select 
                value={newUser.role} 
                onValueChange={(value) => setNewUser({...newUser, role: value})}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione uma função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Membro</SelectItem>
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
              onClick={handleAddUser}
              disabled={!newUser.email || !newUser.password}
            >
              Adicionar Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Altere as informações do usuário.
            </DialogDescription>
          </DialogHeader>
          {editUser && (
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input 
                  id="edit-email" 
                  type="email" 
                  value={editUser.email || ''}
                  disabled
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-username">Nome de Usuário</Label>
                <Input 
                  id="edit-username" 
                  value={editUser.username || ''}
                  onChange={(e) => setEditUser({...editUser, username: e.target.value})}
                  placeholder="nomedeusuario" 
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Função</Label>
                <Select 
                  value={editUser.role} 
                  onValueChange={(value) => setEditUser({...editUser, role: value})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione uma função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Membro</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleEditUser}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente este usuário e todos os seus dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
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

export default UserManagement;
