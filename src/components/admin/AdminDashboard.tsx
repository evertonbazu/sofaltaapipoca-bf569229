
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ListPlus, AlertTriangle, Users, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [subscriptionCount, setSubscriptionCount] = useState<number>(0);
  const [userCount, setUserCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Get subscription count
        const { count: subCount, error: subError } = await supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true });
        
        if (subError) throw subError;
        setSubscriptionCount(subCount || 0);
        
        // Get user count
        const { count: usrCount, error: usrError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        if (usrError) throw usrError;
        setUserCount(usrCount || 0);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Bem-vindo ao painel administrativo do Só Falta a Pipoca</p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md flex items-center gap-3">
          <AlertTriangle className="text-red-500" />
          <span className="text-red-600">{error}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListPlus className="h-5 w-5 text-blue-500" />
              Anúncios
            </CardTitle>
            <CardDescription>Total de anúncios cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {isLoading ? '...' : subscriptionCount}
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => navigate('/admin/subscriptions')}
            >
              Ver Todos os Anúncios
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              Usuários
            </CardTitle>
            <CardDescription>Total de usuários cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {isLoading ? '...' : userCount}
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.open("https://supabase.com/dashboard/project/ljemdnvihzzjwnwweoaq/auth/users", "_blank")}
            >
              Gerenciar Usuários
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-purple-500" />
              Novo Anúncio
            </CardTitle>
            <CardDescription>Criar um novo anúncio</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Crie um novo anúncio para ser exibido na página inicial do site.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-purple-600 hover:bg-purple-700" 
              onClick={() => navigate('/admin/subscriptions/new')}
            >
              Criar Anúncio
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
