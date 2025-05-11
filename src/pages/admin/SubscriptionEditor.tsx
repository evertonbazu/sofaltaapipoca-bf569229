
import React from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import SubscriptionForm from '@/components/admin/SubscriptionForm';

const SubscriptionEditor = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;

  return (
    <AdminLayout title={isEditing ? "Editar Assinatura" : "Nova Assinatura"}>
      <div className="mb-4">
        <h2 className="text-lg font-medium">
          {isEditing ? "Editar Detalhes da Assinatura" : "Adicionar Nova Assinatura"}
        </h2>
        <p className="text-sm text-gray-500">
          {isEditing 
            ? "Atualize as informações da assinatura abaixo." 
            : "Preencha o formulário para adicionar uma nova assinatura."}
        </p>
      </div>

      <SubscriptionForm />
    </AdminLayout>
  );
};

export default SubscriptionEditor;
