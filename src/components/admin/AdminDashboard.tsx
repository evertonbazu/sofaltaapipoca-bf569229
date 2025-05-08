
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    pendingApprovals: 0,
    totalUsers: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Get total subscriptions count
        const { count: totalSubs, error: subsError } = await supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true });
        
        if (subsError) throw subsError;
        
        // Get pending approvals count
        const { count: pendingCount, error: pendingError } = await supabase
          .from('pending_subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('status_approval', 'pending');
        
        if (pendingError) throw pendingError;
        
        // Get active subscriptions (could be customized based on your definition of "active")
        const { count: activeCount, error: activeError } = await supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true })
          .ilike('status', '%Assinado%');
        
        if (activeError) throw activeError;
        
        // Get total users
        const { count: usersCount, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        if (usersError) throw usersError;
        
        setStats({
          totalSubscriptions: totalSubs || 0,
          activeSubscriptions: activeCount || 0,
          pendingApprovals: pendingCount || 0,
          totalUsers: usersCount || 0
        });
        
        // Get subscription data for chart
        const { data: chartSubscriptions, error: chartError } = await supabase
          .from('subscriptions')
          .select('added_date');
        
        if (chartError) throw chartError;
        
        // Process chart data (group subscriptions by month)
        const groupedByMonth = chartSubscriptions.reduce((acc, sub) => {
          if (sub.added_date) {
            const date = new Date(sub.added_date);
            const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;
            
            if (!acc[monthKey]) {
              acc[monthKey] = 0;
            }
            
            acc[monthKey]++;
          }
          return acc;
        }, {});
        
        // Convert to chart format
        const formattedChartData = Object.keys(groupedByMonth).map(key => ({
          month: key,
          count: groupedByMonth[key]
        }));
        
        // Sort by date
        formattedChartData.sort((a, b) => {
          const [aMonth, aYear] = a.month.split('/').map(Number);
          const [bMonth, bYear] = b.month.split('/').map(Number);
          
          if (aYear !== bYear) return aYear - bYear;
          return aMonth - bMonth;
        });
        
        setChartData(formattedChartData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const handlePendingClick = () => {
    navigate('/admin/pending');
  };

  const statCards = [
    { title: 'Total de Anúncios', value: stats.totalSubscriptions, color: 'bg-blue-500' },
    { title: 'Anúncios Ativos', value: stats.activeSubscriptions, color: 'bg-green-500' },
    { title: 'Pendentes de Aprovação', value: stats.pendingApprovals, color: 'bg-yellow-500' },
    { title: 'Total de Usuários', value: stats.totalUsers, color: 'bg-purple-500' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className={`${stat.color} text-white rounded-t-lg py-2`}>
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {stats.pendingApprovals > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div className="mb-4 sm:mb-0">
                <h3 className="font-medium text-yellow-800">Anúncios pendentes de aprovação</h3>
                <p className="text-yellow-700">Existem {stats.pendingApprovals} anúncios aguardando sua revisão.</p>
              </div>
              <Button onClick={handlePendingClick}>Ver anúncios pendentes</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Evolução de Anúncios</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
