
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
import { Edit, Trash2, AlertTriangle, Loader2, UserCheck, UserX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserData {
  id: string;
  username: string | null;
  role: string;
  email?: string;
}

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [roleChangeId, setRoleChangeId] = useState<string | null>(null);
  const [isChangingRole, setIsChangingRole] = useState<boolean>(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) throw profilesError;
      
      // Then get auth users
      const { data: authData, error: authError } = await supabase
        .auth.admin.listUsers();
      
      if (authError) {
        // If admin access fails, just use the profiles data
        setUsers(profiles.map(profile => ({
          id: profile.id,
          username: profile.username,
          role: profile.role,
        })));
      } else {
        // Combine the data if we have access to both
        const authUsers = authData?.users || [];
        const combinedUsers = profiles.map(profile => {
          const authUser = authUsers.find(u => u.id === profile.id);
          return {
            id: profile.id,
            username: profile.username,
            role: profile.role,
            email: authUser?.email
          };
        });
        
        setUsers(combinedUsers);
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Erro ao carregar usuários",
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
      
      try {
        // Try to delete the user from auth
        const { error: authError } = await supabase.auth.admin.deleteUser(deleteId);
        
        if (authError) {
          // If auth admin fails, inform but continue with profile deletion
          console.error("Could not delete user from auth:", authError);
        }
      } catch (error) {
        console.error("Error with admin deletion:", error);
      }
      
      // Delete the profile
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', deleteId);
      
      if (error) throw error;
      
      setUsers(users.filter(user => user.id !== deleteId));
      
      toast({
        title: "Usuário excluído",
        description: "O usuário foi excluído com sucesso."
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir usuário",
        description: err.message
      });
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const confirmRoleChange = (id: string) => {
    setRoleChangeId(id);
  };

  const handleRoleChange = async () => {
    if (!roleChangeId) return;
    
    try {
      setIsChangingRole(true);
      
      const user = users.find(u => u.id === roleChangeId);
      if (!user) throw new Error("Usuário não encontrado");
      
      const newRole = user.role === 'admin' ? 'member' : 'admin';
      
      // Update the profile
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', roleChangeId);
      
      if (error) throw error;
      
      // Update local state
      setUsers(users.map(u => 
        u.id === roleChangeId ? { ...u, role: newRole } : u
      ));
      
      toast({
        title: "Função alterada",
        description: `Usuário agora é ${newRole === 'admin' ? 'Administrador' : 'Membro'}.`
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro ao alterar função",
        description: err.message
      });
    } finally {
      setIsChangingRole(false);
      setRoleChangeId(null);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredUsers = searchTerm
    ? users.filter(user => 
        (user.username?.toLowerCase().includes(searchTerm)) || 
        (user.email?.toLowerCase().includes(searchTerm)) ||
        user.role.toLowerCase().includes(searchTerm)
      )
    : users;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
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
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Função</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="mt-2 text-muted-foreground">Carregando usuários...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  {searchTerm ? "Nenhum resultado encontrado" : "Nenhum usuário cadastrado"}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.username || "Sem nome"}
                  </TableCell>
                  <TableCell>{user.email || "Sem email"}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role === 'admin' ? 'Administrador' : 'Membro'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => confirmRoleChange(user.id)}
                        title={user.role === 'admin' ? 'Remover privilégio de administrador' : 'Tornar administrador'}
                      >
                        {user.role === 'admin' ? (
                          <UserX className="h-4 w-4 text-orange-600" />
                        ) : (
                          <UserCheck className="h-4 w-4 text-green-600" />
                        )}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
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

      {/* Role Change Confirmation Dialog */}
      <AlertDialog open={!!roleChangeId} onOpenChange={() => setRoleChangeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alterar Função de Usuário</AlertDialogTitle>
            <AlertDialogDescription>
              {users.find(u => u.id === roleChangeId)?.role === 'admin' 
                ? "Remover privilégios de administrador deste usuário?" 
                : "Conceder privilégios de administrador para este usuário?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isChangingRole}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRoleChange}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isChangingRole}
            >
              {isChangingRole ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Alterando...
                </>
              ) : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManagement;
