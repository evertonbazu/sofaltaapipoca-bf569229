import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { User, Database, LayoutList, AlertTriangle } from 'lucide-react';
import { TableRow } from '@/types/supabase';

type Subscription = TableRow<'subscriptions'>;
type PendingSubscription = TableRow<'pending_subscriptions'>;
type Profile = TableRow<'profiles'>;
type ContactMessage = TableRow<'contact_messages'>;

interface SubscriptionStat {
  name: string;
  count: number;
}

interface UserStatistic {
  date: string;
  users: number;
}

const AdminDashboard = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [pendingSubscriptions, setPendingSubscriptions] = useState<PendingSubscription[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch subscriptions
        const { data: subsData, error: subsError } = await supabase
          .from('subscriptions')
          .select('*');
        
        if (subsError) throw subsError;
        
        // Fetch pending subscriptions
        const { data: pendingData, error: pendingError } = await supabase
          .from('pending_subscriptions')
          .select('*');
        
        if (pendingError) throw pendingError;
        
        // Fetch users
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('*');
        
        if (userError) throw userError;
        
        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('contact_messages')
          .select('*');
        
        if (messagesError) throw messagesError;
        
        setSubscriptions(subsData || []);
        setPendingSubscriptions(pendingData || []);
        setUsers(userData || []);
        setMessages(messagesData || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Calculate subscription statistics
  const subscriptionStats: SubscriptionStat[] = [
    { name: 'Total', count: subscriptions.length },
    { name: 'Pendentes', count: pendingSubscriptions.length },
  ];

  // Calculate user statistics (dummy data for demonstration)
  const userStats: UserStatistic[] = [
    { date: 'Jan', users: 120 },
    { date: 'Fev', users: 150 },
    { date: 'Mar', users: 180 },
    { date: 'Abr', users: 200 },
    { date: 'Mai', users: 220 },
  ];

  // Calculate recent users (dummy data for demonstration)
  const recentUsers = users.slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de Anúncios
          </CardTitle>
          <Database className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{subscriptions.length}</div>
          <p className="text-xs text-gray-500">
            {pendingSubscriptions.length} pendentes
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de Usuários
          </CardTitle>
          <User className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{users.length}</div>
          <p className="text-xs text-gray-500">
            {recentUsers.length} usuários recentes
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Mensagens de Contato
          </CardTitle>
          <LayoutList className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{messages.length}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Alertas
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0</div>
          <p className="text-xs text-gray-500">Sem alertas</p>
        </CardContent>
      </Card>
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Estatísticas de Anúncios</CardTitle>
          <CardDescription>Visão geral do número de anúncios.</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subscriptionStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Estatísticas de Usuários</CardTitle>
          <CardDescription>Número de usuários ao longo do tempo.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
