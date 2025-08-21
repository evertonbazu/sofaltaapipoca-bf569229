
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Package, Clock, CheckCircle, AlertTriangle, Users, Calendar, TrendingUp } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSubscriptions: 0,
    featuredSubscriptions: 0,
    pendingApproval: 0,
    errors: 0,
    totalUsers: 0,
    visibleSubscriptions: 0,
    recentSubscriptions: 0,
    pendingModifications: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Obter contagem total de assinaturas
        const { count: totalCount, error: totalError } = await supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true });
        
        // Obter contagem de assinaturas em destaque
        const { count: featuredCount, error: featuredError } = await supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('featured', true);

        // Obter contagem de solicitações pendentes
        const { count: pendingCount, error: pendingError } = await supabase
          .from('pending_subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('status_approval', 'pending');

        // Obter contagem de erros
        const { count: errorsCount, error: errorsError } = await supabase
          .from('error_logs')
          .select('*', { count: 'exact', head: true })
          .eq('resolved', false);

        // Obter contagem de usuários
        const { count: usersCount, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Obter contagem de assinaturas visíveis
        const { count: visibleCount, error: visibleError } = await supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('visible', true);

        // Obter contagem de assinaturas adicionadas nos últimos 30 dias
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const { count: recentCount, error: recentError } = await supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', thirtyDaysAgo.toISOString());

        // Obter contagem de modificações pendentes
        const { count: modificationsCount, error: modificationsError } = await supabase
          .from('subscription_modifications')
          .select('*', { count: 'exact', head: true })
          .eq('status_approval', 'pending');

        if (totalError || featuredError || pendingError || errorsError || usersError || visibleError || recentError || modificationsError) {
          throw new Error('Erro ao buscar estatísticas');
        }

        setStats({
          totalSubscriptions: totalCount || 0,
          featuredSubscriptions: featuredCount || 0,
          pendingApproval: pendingCount || 0,
          errors: errorsCount || 0,
          totalUsers: usersCount || 0,
          visibleSubscriptions: visibleCount || 0,
          recentSubscriptions: recentCount || 0,
          pendingModifications: modificationsCount || 0,
        });
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <AdminLayout title="Dashboard">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Assinaturas
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSubscriptions}</div>
                <p className="text-xs text-muted-foreground">
                  Assinaturas cadastradas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Em Destaque
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.featuredSubscriptions}</div>
                <p className="text-xs text-muted-foreground">
                  Assinaturas em destaque
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Solicitações Pendentes
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingApproval}</div>
                <p className="text-xs text-muted-foreground">
                  Aguardando aprovação
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Erros Registrados
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.errors}</div>
                <p className="text-xs text-muted-foreground">
                  Erros não resolvidos
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Segunda linha de estatísticas */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Usuários
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Usuários registrados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Assinaturas Visíveis
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.visibleSubscriptions}</div>
                <p className="text-xs text-muted-foreground">
                  Disponíveis publicamente
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Últimos 30 dias
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.recentSubscriptions}</div>
                <p className="text-xs text-muted-foreground">
                  Assinaturas adicionadas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Modificações Pendentes
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingModifications}</div>
                <p className="text-xs text-muted-foreground">
                  Aguardando revisão
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Dashboard;
