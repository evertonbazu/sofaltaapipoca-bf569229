
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Search, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import SubscriptionList from '@/components/admin/SubscriptionList';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

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
            onClick={() => navigate('/admin/subscriptions/new')} 
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Nova Assinatura
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Barra de pesquisa para filtrar assinaturas */}
        <div className="flex items-center border rounded-md bg-white p-2">
          <Search className="h-5 w-5 text-gray-400 mr-2" />
          <Input
            type="text"
            placeholder="Buscar assinaturas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-transparent"
          />
        </div>

        {/* Lista de assinaturas filtrada pelo termo de busca */}
        <SubscriptionList 
          key={refreshKey} 
          searchTerm={searchTerm} 
        />
      </div>
    </AdminLayout>
  );
};

export default Subscriptions;
