
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Download } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { saveAs } from 'file-saver';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SubscriptionData } from '@/types/subscriptionTypes';

const ExportSubscriptionsTxt: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const { toast } = useToast();

  React.useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setIsLoadingData(true);
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('added_date', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        const formattedData: SubscriptionData[] = data.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          paymentMethod: item.payment_method,
          status: item.status,
          access: item.access,
          headerColor: item.header_color,
          priceColor: item.price_color,
          whatsappNumber: item.whatsapp_number,
          telegramUsername: item.telegram_username,
          icon: item.icon,
          addedDate: item.added_date
        }));
        
        setSubscriptions(formattedData);
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar anúncios",
        description: err.message
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleCheckboxChange = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === subscriptions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(subscriptions.map(sub => sub.id || '').filter(Boolean));
    }
  };

  const handleExportTxt = async () => {
    try {
      setIsLoading(true);
      
      if (selectedIds.length === 0) {
        toast({
          title: "Nenhum anúncio selecionado",
          description: "Selecione pelo menos um anúncio para exportar.",
          variant: "destructive"
        });
        return;
      }

      // Filter selected subscriptions
      const selectedSubscriptions = subscriptions.filter(sub => 
        sub.id && selectedIds.includes(sub.id)
      );

      // Generate text content
      let textContent = "ANÚNCIOS EXPORTADOS - SÓ FALTA A PIPOCA\n";
      textContent += "Data de exportação: " + new Date().toLocaleDateString('pt-BR') + "\n\n";

      selectedSubscriptions.forEach((sub, index) => {
        textContent += `=== ANÚNCIO ${index + 1} ===\n`;
        textContent += `Título: ${sub.title}\n`;
        textContent += `Preço: ${sub.price}\n`;
        textContent += `Forma de pagamento: ${sub.paymentMethod}\n`;
        textContent += `Status: ${sub.status}\n`;
        textContent += `Acesso: ${sub.access}\n`;
        textContent += `WhatsApp: ${sub.whatsappNumber}\n`;
        textContent += `Telegram: ${sub.telegramUsername}\n`;
        textContent += `Data de adição: ${sub.addedDate}\n\n`;
      });
      
      // Create blob and save file
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, `anuncios_${new Date().toISOString().split('T')[0]}.txt`);
      
      toast({
        title: "Exportação concluída",
        description: `${selectedSubscriptions.length} anúncios exportados com sucesso.`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error exporting subscriptions to TXT:', error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os anúncios. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exportar Anúncios para TXT</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingData ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4">
              <Checkbox 
                id="select-all" 
                checked={selectedIds.length === subscriptions.length && subscriptions.length > 0} 
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                Selecionar todos
              </label>
            </div>
            
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {subscriptions.map(subscription => (
                <div 
                  key={subscription.id} 
                  className="flex items-center gap-2 border rounded-md p-3 hover:bg-gray-50"
                >
                  <Checkbox 
                    id={subscription.id} 
                    checked={selectedIds.includes(subscription.id || '')}
                    onCheckedChange={() => handleCheckboxChange(subscription.id || '')}
                  />
                  <label htmlFor={subscription.id} className="flex-1 cursor-pointer">
                    <p className="font-medium">{subscription.title}</p>
                    <p className="text-sm text-gray-500">{subscription.price}</p>
                  </label>
                </div>
              ))}
            </div>
            
            {subscriptions.length === 0 && (
              <p className="text-center py-8 text-gray-500">Nenhum anúncio encontrado.</p>
            )}
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleExportTxt} 
          disabled={isLoading || isLoadingData || selectedIds.length === 0}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {isLoading ? 'Exportando...' : 'Exportar Selecionados (.TXT)'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ExportSubscriptionsTxt;
