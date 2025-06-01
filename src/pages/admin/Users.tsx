
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users as UsersIcon, Trash2, Edit, Save, X } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import UsersList from '@/components/admin/UsersList';

/**
 * Página de gerenciamento de usuários no painel administrativo
 * @version 5.2.0
 */
const Users = () => {
  return (
    <AdminLayout title="Gerenciar Usuários">
      <div className="mb-4">
        <h2 className="text-lg font-medium">Usuários do Sistema</h2>
        <p className="text-sm text-gray-500">
          Visualize, edite e gerencie todos os usuários cadastrados no sistema.
        </p>
      </div>

      <UsersList />
    </AdminLayout>
  );
};

export default Users;
