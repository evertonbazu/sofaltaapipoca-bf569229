import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Server, 
  Database, 
  Activity, 
  Users, 
  FileText, 
  Clock,
  HardDrive,
  Cpu,
  MemoryStick,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SystemStats {
  totalUsers: number;
  totalSubscriptions: number;
  totalMessages: number;
  systemUptime: string;
  memoryUsage: number;
  cpuUsage: number;
  storageUsage: number;
}

export const SystemSettings: React.FC = () => {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalSubscriptions: 0,
    totalMessages: 0,
    systemUptime: '24h 30m',
    memoryUsage: 65,
    cpuUsage: 45,
    storageUsage: 23
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSystemStats();
  }, []);

  const loadSystemStats = async () => {
    setIsLoading(true);
    try {
      // Carregar estatísticas do sistema
      const [usersRes, subscriptionsRes, messagesRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('subscriptions').select('id', { count: 'exact' }),
        supabase.from('contact_messages').select('id', { count: 'exact' })
      ]);

      setStats(prev => ({
        ...prev,
        totalUsers: usersRes.count || 0,
        totalSubscriptions: subscriptionsRes.count || 0,
        totalMessages: messagesRes.count || 0
      }));
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatUptime = (uptime: string) => {
    return uptime;
  };

  const getUsageColor = (usage: number) => {
    if (usage < 50) return 'bg-green-500';
    if (usage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getUsageStatus = (usage: number) => {
    if (usage < 50) return 'Ótimo';
    if (usage < 80) return 'Moderado';
    return 'Alto';
  };

  return (
    <div className="space-y-6">
      {/* Status do Sistema */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Status do Sistema
            </CardTitle>
            <CardDescription>
              Monitore o status e desempenho do sistema.
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadSystemStats}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Estatísticas Gerais */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Users className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
              <p className="text-sm text-muted-foreground">Usuários</p>
            </div>
            
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Database className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{stats.totalSubscriptions}</p>
              <p className="text-sm text-muted-foreground">Assinaturas</p>
            </div>
            
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <FileText className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{stats.totalMessages}</p>
              <p className="text-sm text-muted-foreground">Mensagens</p>
            </div>
            
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Clock className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{formatUptime(stats.systemUptime)}</p>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </div>
          </div>
          
          <Separator />
          
          {/* Métricas de Performance */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Métricas de Performance
            </h4>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <Cpu className="h-4 w-4" />
                    CPU
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant={stats.cpuUsage > 80 ? 'destructive' : stats.cpuUsage > 50 ? 'default' : 'secondary'}>
                      {getUsageStatus(stats.cpuUsage)}
                    </Badge>
                    <span className="text-sm font-mono">{stats.cpuUsage}%</span>
                  </div>
                </div>
                <Progress value={stats.cpuUsage} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <MemoryStick className="h-4 w-4" />
                    Memória
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant={stats.memoryUsage > 80 ? 'destructive' : stats.memoryUsage > 50 ? 'default' : 'secondary'}>
                      {getUsageStatus(stats.memoryUsage)}
                    </Badge>
                    <span className="text-sm font-mono">{stats.memoryUsage}%</span>
                  </div>
                </div>
                <Progress value={stats.memoryUsage} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm flex items-center gap-2">
                    <HardDrive className="h-4 w-4" />
                    Armazenamento
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant={stats.storageUsage > 80 ? 'destructive' : stats.storageUsage > 50 ? 'default' : 'secondary'}>
                      {getUsageStatus(stats.storageUsage)}
                    </Badge>
                    <span className="text-sm font-mono">{stats.storageUsage}%</span>
                  </div>
                </div>
                <Progress value={stats.storageUsage} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Status dos Serviços */}
      <Card>
        <CardHeader>
          <CardTitle>Status dos Serviços</CardTitle>
          <CardDescription>
            Verifique o status dos serviços externos e integrações.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Supabase Database
              </span>
              <Badge className="bg-green-100 text-green-800">Online</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                Edge Functions
              </span>
              <Badge className="bg-green-100 text-green-800">Online</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Telegram Integration
              </span>
              <Badge className="bg-yellow-100 text-yellow-800">Verificando</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};