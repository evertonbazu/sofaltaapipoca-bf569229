
import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import ButtonsManager from '@/components/admin/ButtonsManager';

const Buttons = () => {
  return (
    <AdminLayout title="Gerenciar Botões">
      <div className="mb-4">
        <h2 className="text-lg font-medium">Botões da Tela Inicial</h2>
        <p className="text-sm text-gray-500">
          Gerencie os botões que aparecem na tela inicial da aplicação.
        </p>
      </div>
      
      <ButtonsManager />
    </AdminLayout>
  );
};

export default Buttons;
