import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableRow as ProfileTableRow } from '@/types/supabase';
import { Edit, Trash, User, Mail } from 'lucide-react';

type ProfileFromSupabase = ProfileTableRow<'profiles'>;

const UserManagement = () => {
  const [users, setUsers] = useState<ProfileFromSupabase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<ProfileFromSupabase | null>(null);
  const [editedRole, setEditedRole] = useState<string>('');
  const [editedUsername, setEditedUsername] = useState<string>('');
  const [sortColumn, setSortColumn] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch all profiles directly
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
      
      if (error) throw error;
      
      const typedUsers = data as ProfileFromSupabase[];
      setUsers(typedUsers || []);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar usuários",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: ProfileFromSupabase) => {
    setCurrentUser(user);
    setEditedRole(user.role || '');
    setEditedUsername(user.username || '');
    setEditDialogOpen(true);
  };

  const handleDelete = (user: ProfileFromSupabase) => {
    setCurrentUser(user);
    setDeleteDialogOpen(true);
  };

  const confirmEdit = async () => {
    if (!currentUser) return;
    
    try {
      // Make sure the edited role matches one of the allowed values
      const validRole = ['admin', 'member', 'user'].includes(editedRole) 
        ? editedRole as 'admin' | 'member' | 'user' 
        : 'user';
      
      const { error } = await supabase
        .from('profiles')
        .update({
          role: validRole,
          username: editedUsername,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);
      
      if (error) throw error;
      
      // Update local state
      setUsers(prev => 
        prev.map(user => 
          user.id === currentUser.id 
            ? { ...user, role: validRole, username: editedUsername } 
            : user
        )
      );
      
      toast({
        title: "Usuário atualizado",
        description: "As informações do usuário foram atualizadas com sucesso."
      });
      
      setEditDialogOpen(false);
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar usuário",
        description: error.message
      });
    }
  };

  const confirmDelete = async () => {
    if (!currentUser) return;
    
    try {
      // First delete any subscriptions associated with the user
      const { error: subsError } = await supabase
        .from('subscriptions')
        .delete()
        .eq('user_id', currentUser.id);
        
      if (subsError) throw subsError;
      
      // Delete any pending subscriptions
      const { error: pendingError } = await supabase
        .from('pending_subscriptions')
        .delete()
        .eq('user_id', currentUser.id);
        
      if (pendingError) throw pendingError;
      
      // Delete any contact messages
      const { error: contactError } = await supabase
        .from('contact_messages')
        .delete()
        .eq('user_id', currentUser.id);
        
      if (contactError) throw contactError;
      
      // Delete the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', currentUser.id);
        
      if (profileError) throw profileError;
      
      // Delete the auth user (requires admin privileges)
      const { error: authError } = await supabase.auth.admin.deleteUser(currentUser.id);
      
      if (authError) throw authError;
      
      // Update local state
      setUsers(prev => prev.filter(user => user.id !== currentUser.id));
      
      toast({
        title: "Usuário excluído",
        description: "O usuário e todos os seus dados foram excluídos com sucesso."
      });
      
      setDeleteDialogOpen(false);
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir usuário",
        description: error.message
      });
    }
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  const getSortedUsers = () => {
    const filtered = users.filter(user => 
      (user.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
      (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
    
    return [...filtered].sort((a, b) => {
      // Handle date columns differently
      if (sortColumn === 'created_at' || sortColumn === 'updated_at') {
        const dateA = a[sortColumn] ? new Date(a[sortColumn]).getTime() : 0;
        const dateB = b[sortColumn] ? new Date(b[sortColumn]).getTime() : 0;
        
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      // Handle string columns
      const valA = a[sortColumn]?.toString().toLowerCase() || '';
      const valB = b[sortColumn]?.toString().toLowerCase() || '';
      
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gerenciar Usuários</h1>
      </div>
      
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <div className="w-full max-w-sm">
          <Input 
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSort('username')}
            className={sortColumn === 'username' ? 'border-blue-500' : ''}
          >
            Nome {sortColumn === 'username' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSort('email')}
            className={sortColumn === 'email' ? 'border-blue-500' : ''}
          >
            Email {sortColumn === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSort('role')}
            className={sortColumn === 'role' ? 'border-blue-500' : ''}
          >
            Função {sortColumn === 'role' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSort('created_at')}
            className={sortColumn === 'created_at' ? 'border-blue-500' : ''}
          >
            Data Criação {sortColumn === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead>Última Atualização</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getSortedUsers().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                    Nenhum usuário encontrado
                  </TableCell>
                </TableRow>
              ) : (
                getSortedUsers().map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      {user.username || 'Sem nome'}
                    </TableCell>
                    <TableCell className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      {user.email || 'Sem email'}
                    </TableCell>
                    <TableCell>
                      <span className={
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium'
                          : 'bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium'
                      }>
                        {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell>
                      {formatDate(user.updated_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(user)}
                          className="flex gap-1 items-center"
                        >
                          <Edit className="h-4 w-4" /> Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm" 
                          onClick={() => handleDelete(user)}
                          className="flex gap-1 items-center text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          <Trash className="h-4 w-4" /> Excluir
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Altere as informações do usuário abaixo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome de Usuário</label>
              <Input 
                value={editedUsername} 
                onChange={(e) => setEditedUsername(e.target.value)}
                placeholder="Nome de usuário"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Função</label>
              <Select value={editedRole} onValueChange={setEditedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="user">Usuário</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={confirmEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este usuário? Esta ação também excluirá todos os anúncios e mensagens associados a este usuário e não pode ser desfeita.
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
    </div>
  );
};

export default UserManagement;
