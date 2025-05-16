
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
  const [errorLogs, setErrorLogs] = useState<any[]>([]);
  const [subscriptionStats, setSubscriptionStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Buscar logs de erro não resolvidos
        const { data: logData, error: logError } = await supabase
          .from('error_logs')
          .select('*')
          .eq('resolved', false)
          .limit(10);

        if (logError) {
          console.error('Erro ao buscar logs de erro:', logError);
        } else {
          setErrorLogs(logData || []);
        }

        // Buscar estatísticas de assinaturas (mockup)
        // Em um ambiente real, isso seria buscado do banco de dados
        setSubscriptionStats([
          { name: 'Jan', visitors: 400, subscriptions: 24 },
          { name: 'Fev', visitors: 300, subscriptions: 13 },
          { name: 'Mar', visitors: 500, subscriptions: 22 },
          { name: 'Abr', visitors: 700, subscriptions: 34 },
          { name: 'Mai', visitors: 600, subscriptions: 28 },
          { name: 'Jun', visitors: 800, subscriptions: 39 }
        ]);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Dashboard Administrativo</h2>
      
      {isLoading ? (
        <div className="text-center py-8">Carregando dados do dashboard...</div>
      ) : (
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="subscriptions">Assinaturas</TabsTrigger>
            <TabsTrigger value="errors">Erros</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">Total de Visitas</h3>
                  <p className="text-2xl font-bold">3,400</p>
                  <p className="text-sm text-green-500">+14% este mês</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">Assinaturas Ativas</h3>
                  <p className="text-2xl font-bold">160</p>
                  <p className="text-sm text-green-500">+5% este mês</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">Erros Reportados</h3>
                  <p className="text-2xl font-bold">{errorLogs.length}</p>
                  <p className="text-sm text-red-500">Não resolvidos</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-4">Visitas vs. Assinaturas</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={subscriptionStats}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="visitors" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line yAxisId="right" type="monotone" dataKey="subscriptions" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="subscriptions">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-4">Assinaturas por Mês</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={subscriptionStats}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="subscriptions" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="errors">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-4">Erros Recentes</h3>
                {errorLogs.length > 0 ? (
                  <div className="space-y-2">
                    {errorLogs.map((log) => (
                      <div key={log.id} className="border p-3 rounded-md">
                        <p className="font-medium text-red-600">{log.error_code || 'Error'}</p>
                        <p className="text-sm">{log.error_message}</p>
                        <p className="text-xs text-gray-500">{new Date(log.created_at).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-4">Nenhum erro não resolvido.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Dashboard;
