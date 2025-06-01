
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trash2, Edit, Save, X, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  phone: string;
  role: string;
  created_at: string;
}

/**
 * Lista de usuários para o painel administrativo
 * @version 1.0.0
 */
const UsersList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de usuários.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (user: User) => {
    setEditingUser(user.id);
    setEditForm(user);
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: editForm.username,
          full_name: editForm.full_name,
          phone: editForm.phone,
          role: editForm.role,
        })
        .eq('id', editingUser);

      if (error) throw error;

      setUsers(users.map(user => 
        user.id === editingUser ? { ...user, ...editForm } : user
      ));

      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso.",
      });

      setEditingUser(null);
      setEditForm({});
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o usuário.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setDeletingUser(userId);
      
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.filter(user => user.id !== userId));

      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o usuário.",
        variant: "destructive",
      });
    } finally {
      setDeletingUser(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando usuários...</span>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por email, nome ou usuário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Nome de Usuário</TableHead>
                <TableHead>Nome Completo</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Data de Cadastro</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    {searchTerm ? 'Nenhum usuário encontrado com esse termo de busca.' : 'Nenhum usuário encontrado.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {editingUser === user.id ? (
                        <Input
                          value={editForm.username || ''}
                          onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                          className="w-32"
                        />
                      ) : (
                        user.username || '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {editingUser === user.id ? (
                        <Input
                          value={editForm.full_name || ''}
                          onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                          className="w-40"
                        />
                      ) : (
                        user.full_name || '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {editingUser === user.id ? (
                        <Input
                          value={editForm.phone || ''}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          className="w-32"
                        />
                      ) : (
                        user.phone || '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {editingUser === user.id ? (
                        <Select
                          value={editForm.role || 'user'}
                          onValueChange={(value) => setEditForm({ ...editForm, role: value })}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">Usuário</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role === 'admin' ? 'Admin' : 'Usuário'}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {editingUser === user.id ? (
                          <>
                            <Button
                              size="sm"
                              onClick={handleSaveEdit}
                              className="h-8 w-8 p-0"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(user)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(user.id)}
                              disabled={deletingUser === user.id}
                              className="h-8 w-8 p-0"
                            >
                              {deletingUser === user.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          Total: {filteredUsers.length} usuário(s)
        </div>
      </CardContent>
    </Card>
  );
};

export default UsersList;
