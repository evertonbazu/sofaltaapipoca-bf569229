
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface UserReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

interface SubscriptionReport {
  id: string;
  title: string;
  custom_title?: string;
  price: string;
  status: string;
  created_at: string;
  updated_at: string;
  visible: boolean;
  source: 'active' | 'expired';
  expired_at?: string;
  expiry_reason?: string;
}

/**
 * Diálogo de relatório detalhado de usuário
 * @version 1.0.0
 */
const UserReportDialog: React.FC<UserReportDialogProps> = ({
  isOpen,
  onClose,
  userId,
  userName
}) => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionReport[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchUserReport = async () => {
    try {
      setIsLoading(true);

      // Buscar assinaturas ativas
      const { data: activeSubscriptions, error: activeError } = await supabase
        .from('subscriptions')
        .select('id, title, custom_title, price, status, created_at, updated_at, visible')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (activeError) throw activeError;

      // Buscar assinaturas expiradas
      const { data: expiredSubscriptions, error: expiredError } = await supabase
        .from('expired_subscriptions')
        .select('id, title, custom_title, price, status, created_at, expired_at, expiry_reason')
        .eq('user_id', userId)
        .order('expired_at', { ascending: false });

      if (expiredError) throw expiredError;

      // Buscar logs de atividades
      const { data: activityLogs, error: logsError } = await supabase
        .from('subscription_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;

      // Combinar dados
      const activeData: SubscriptionReport[] = (activeSubscriptions || []).map(sub => ({
        ...sub,
        source: 'active' as const
      }));

      const expiredData: SubscriptionReport[] = (expiredSubscriptions || []).map(sub => ({
        ...sub,
        source: 'expired' as const,
        updated_at: sub.expired_at
      }));

      const allSubscriptions = [...activeData, ...expiredData]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setSubscriptions(allSubscriptions);
      setLogs(activityLogs || []);

    } catch (error) {
      console.error('Erro ao buscar relatório do usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o relatório do usuário.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserReport();
    }
  }, [isOpen, userId]);

  const exportToCSV = () => {
    const csvContent = [
      ['Título', 'Preço', 'Status', 'Situação', 'Criado em', 'Atualizado em'].join(','),
      ...subscriptions.map(sub => [
        `"${sub.custom_title || sub.title}"`,
        `"${sub.price}"`,
        `"${sub.status}"`,
        `"${sub.source === 'active' ? 'Ativa' : 'Expirada'}"`,
        `"${new Date(sub.created_at).toLocaleDateString('pt-BR')}"`,
        `"${new Date(sub.updated_at || sub.created_at).toLocaleDateString('pt-BR')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Relatório de {userName}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Carregando relatório...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Resumo */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {subscriptions.filter(s => s.source === 'active').length}
                </div>
                <div className="text-sm text-blue-800">Assinaturas Ativas</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {subscriptions.filter(s => s.source === 'expired').length}
                </div>
                <div className="text-sm text-red-800">Assinaturas Expiradas</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {subscriptions.length}
                </div>
                <div className="text-sm text-green-800">Total de Anúncios</div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Histórico de Assinaturas</h3>
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>

            {/* Tabela de assinaturas */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Situação</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Atualizado em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        Nenhuma assinatura encontrada para este usuário.
                      </TableCell>
                    </TableRow>
                  ) : (
                    subscriptions.map((subscription) => (
                      <TableRow key={`${subscription.source}-${subscription.id}`}>
                        <TableCell className="font-medium">
                          {subscription.custom_title || subscription.title}
                        </TableCell>
                        <TableCell>{subscription.price}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{subscription.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={subscription.source === 'active' ? 'default' : 'destructive'}
                          >
                            {subscription.source === 'active' ? 'Ativa' : 'Expirada'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(subscription.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          {new Date(subscription.updated_at || subscription.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Logs de atividade */}
            {logs.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Últimas Atividades</h3>
                <div className="max-h-40 overflow-y-auto border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ação</TableHead>
                        <TableHead>Assinatura</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <Badge variant="outline">
                              {log.action_type === 'addition' ? 'Adição' : 
                               log.action_type === 'update' ? 'Atualização' : 'Exclusão'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {log.subscription_title}
                          </TableCell>
                          <TableCell>
                            {new Date(log.created_at).toLocaleDateString('pt-BR')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserReportDialog;
