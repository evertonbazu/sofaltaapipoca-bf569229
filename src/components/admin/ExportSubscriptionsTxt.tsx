
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Download } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { exportSubscriptionsAsTxt } from '@/utils/exportHelpers';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Subscription {
  id: string;
  title: string;
  price: string;
  payment_method: string;
  status: string;
  access: string;
  whatsapp_number: string;
  telegram_username: string;
  pix_qr_code?: string;
}

const ExportSubscriptionsTxt: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setIsFetching(true);
      setError(null);

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('added_date', { ascending: false });

      if (error) throw error;
      
      setSubscriptions(data || []);
      
      // Initialize all subscriptions as unselected
      const initialSelected: Record<string, boolean> = {};
      data?.forEach((sub: Subscription) => {
        initialSelected[sub.id] = false;
      });
      setSelectedSubscriptions(initialSelected);
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Erro ao carregar anúncios",
        description: err.message,
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleSelectAll = () => {
    const allSelected = subscriptions.every(sub => selectedSubscriptions[sub.id]);
    const updatedSelection = { ...selectedSubscriptions };
    
    subscriptions.forEach(sub => {
      updatedSelection[sub.id] = !allSelected;
    });
    
    setSelectedSubscriptions(updatedSelection);
  };

  const handleSelectSubscription = (id: string) => {
    setSelectedSubscriptions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleExport = async () => {
    try {
      setIsLoading(true);
      
      // Get selected subscriptions
      const selectedSubs = subscriptions.filter(sub => selectedSubscriptions[sub.id]);
      
      // Use the utility function to export subscriptions
      exportSubscriptionsAsTxt(selectedSubs);
    } catch (err: any) {
      console.error('Error exporting subscriptions:', err);
      toast({
        variant: "destructive",
        title: "Erro na exportação",
        description: "Não foi possível exportar os anúncios. Tente novamente."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => 
    sub.title.toLowerCase().includes(searchTerm) || 
    sub.telegram_username.toLowerCase().includes(searchTerm)
  );

  const selectedCount = Object.values(selectedSubscriptions).filter(Boolean).length;
  const allSelected = subscriptions.length > 0 && subscriptions.every(sub => selectedSubscriptions[sub.id]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Exportar Anúncios (TXT)</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md flex items-center gap-3 mb-6">
          <div className="text-red-600">{error}</div>
        </div>
      )}
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Selecione os anúncios para exportar</CardTitle>
          <CardDescription>Escolha os anúncios que deseja incluir no arquivo TXT</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-4">
            <div className="w-full max-w-md">
              <Label htmlFor="search">Pesquisar</Label>
              <Input
                id="search"
                placeholder="Buscar por título ou usuário..."
                value={searchTerm}
                onChange={handleSearch}
                className="mt-1"
              />
            </div>
            
            <div className="flex items-end">
              <Button
                onClick={handleExport}
                disabled={isLoading || selectedCount === 0}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {isLoading ? 'Exportando...' : `Exportar (${selectedCount})`}
              </Button>
            </div>
          </div>
          
          <div className="rounded-md border mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Selecionar todos"
                    />
                  </TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead className="hidden md:table-cell">Preço</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Telegram</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isFetching ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                        <span className="mt-2 text-muted-foreground">Carregando anúncios...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredSubscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      {searchTerm ? "Nenhum resultado encontrado" : "Nenhum anúncio disponível"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubscriptions.map((sub) => (
                    <TableRow key={sub.id} className="cursor-pointer" onClick={() => handleSelectSubscription(sub.id)}>
                      <TableCell className="p-2">
                        <Checkbox
                          checked={selectedSubscriptions[sub.id] || false}
                          onCheckedChange={() => handleSelectSubscription(sub.id)}
                          aria-label={`Selecionar ${sub.title}`}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{sub.title}</TableCell>
                      <TableCell className="hidden md:table-cell">{sub.price}</TableCell>
                      <TableCell className="hidden sm:table-cell">{sub.status}</TableCell>
                      <TableCell className="hidden lg:table-cell">{sub.telegram_username}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportSubscriptionsTxt;
