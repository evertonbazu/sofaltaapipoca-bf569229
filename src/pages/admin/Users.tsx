
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users as UsersIcon, Trash2, Edit, Save, X, Plus } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import UsersList from '@/components/admin/UsersList';
import UserRegistrationForm from '@/components/admin/UserRegistrationForm';

/**
 * Página de gerenciamento de usuários no painel administrativo
 * @version 5.3.0
 */
const Users = () => {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUserCreated = () => {
    setRefreshKey(prev => prev + 1);
    setShowRegistrationForm(false);
  };

  return (
    <AdminLayout title="Gerenciar Usuários">
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium">Usuários do Sistema</h2>
            <p className="text-sm text-gray-500">
              Visualize, edite e gerencie todos os usuários cadastrados no sistema.
            </p>
          </div>
          <Button 
            onClick={() => setShowRegistrationForm(!showRegistrationForm)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {showRegistrationForm ? 'Cancelar' : 'Novo Usuário'}
          </Button>
        </div>
      </div>

      {showRegistrationForm && (
        <UserRegistrationForm onUserCreated={handleUserCreated} />
      )}

      <UsersList key={refreshKey} />
    </AdminLayout>
  );
};

export default Users;
