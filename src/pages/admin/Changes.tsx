
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, RefreshCw, History } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';

interface SubscriptionLog {
  id: string;
  subscription_title: string;
  action_type: 'addition' | 'deletion' | 'update';
  user_name: string;
  created_at: string;
}

/**
 * Página de log de alterações de assinaturas
 * @version 3.9.4
 */
const Changes = () => {
  const [logs, setLogs] = useState<SubscriptionLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('subscription_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setLogs(data || []);
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
      toast({
        title: "Erro ao carregar logs",
        description: "Não foi possível carregar o histórico de alterações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionText = (actionType: string) => {
    switch (actionType) {
      case 'addition':
        return 'Adição';
      case 'deletion':
        return 'Exclusão';
      case 'update':
        return 'Atualização';
      default:
        return 'Alteração';
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'addition':
        return 'text-green-600';
      case 'deletion':
        return 'text-red-600';
      case 'update':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AdminLayout title="Log de Alterações">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium">Histórico de Alterações</h2>
            <p className="text-sm text-gray-500">
              Visualize todas as alterações realizadas nos anúncios pelos usuários e administradores.
            </p>
          </div>
          <Button 
            variant="outline"
            onClick={fetchLogs} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Atualizar
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Log de Alterações
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Carregando histórico...</span>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma alteração encontrada no histórico.
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div 
                    key={log.id} 
                    className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <span className={`font-medium ${getActionColor(log.action_type)}`}>
                          {getActionText(log.action_type)}:
                        </span>
                        <span className="ml-2 font-semibold text-gray-900">
                          {log.subscription_title}
                        </span>
                        <span className="ml-2 text-gray-600">
                          - {log.user_name || 'Sistema'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(log.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Changes;
