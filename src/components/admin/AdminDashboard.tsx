
// Component to display admin dashboard
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowRight } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [totalSubscriptions, setTotalSubscriptions] = useState<number>(0);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Get total subscriptions
        const { count: subsCount, error: subsError } = await supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true });
        
        if (subsError) throw subsError;
        setTotalSubscriptions(subsCount || 0);

        // Get pending subscriptions count
        const { count: pendingCount, error: pendingError } = await supabase
          .from('pending_subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('status_approval', 'pending');
        
        if (pendingError) throw pendingError;
        setPendingCount(pendingCount || 0);

        // Get total users count
        const { count: usersCount, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        if (usersError) throw usersError;
        setTotalUsers(usersCount || 0);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Dashboard</h2>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{totalSubscriptions}</CardTitle>
            <CardDescription>Anúncios Ativos</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Total de anúncios aprovados e publicados no site.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigate('/admin/subscriptions')}>
              Ver todos os anúncios
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{pendingCount}</CardTitle>
            <CardDescription>Anúncios Pendentes</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Anúncios aguardando aprovação.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              variant={pendingCount > 0 ? "default" : "outline"} 
              className="w-full"
              onClick={() => navigate('/admin/pending')}
            >
              Ver anúncios pendentes
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{totalUsers}</CardTitle>
            <CardDescription>Usuários Cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Total de usuários cadastrados no sistema.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigate('/admin/users')}>
              Gerenciar usuários
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
