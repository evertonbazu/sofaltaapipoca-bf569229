
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import SubscriptionList from '@/components/admin/SubscriptionList';
import { useToast } from '@/components/ui/use-toast';

/**
 * Página de gerenciamento de assinaturas
 * @version 3.9.0
 */
const Subscriptions = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState<number>(0); // Para forçar recarga do componente

  const handleRefresh = () => {
    toast({
      title: "Atualizando lista de assinaturas",
      description: "Buscando dados mais recentes do servidor...",
    });
    setRefreshKey(prev => prev + 1);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  return (
    <AdminLayout title="Gerenciar Assinaturas">
      <div className="mb-4 flex justify-between">
        <div>
          <h2 className="text-lg font-medium">Lista de Assinaturas</h2>
          <p className="text-sm text-gray-500">
            Visualize, edite, aprove ou exclua assinaturas existentes.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleRefresh} 
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/admin/reports')} 
            className="flex items-center gap-1"
          >
            <FileText className="h-4 w-4" />
            Relatórios
          </Button>
          <Button 
            onClick={() => navigate('/admin/subscriptions/new')} 
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Nova Assinatura
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Removendo o campo de busca duplicado e usando apenas o do componente SubscriptionList */}
        <SubscriptionList 
          key={refreshKey} 
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />
      </div>
    </AdminLayout>
  );
};

export default Subscriptions;
