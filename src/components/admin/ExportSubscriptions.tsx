
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { useToast } from "@/components/ui/use-toast";
import { SubscriptionData } from '@/types/subscriptionTypes';

const ExportSubscriptions: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all subscriptions from the database
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('added_date', { ascending: false });
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        toast({
          title: "Nenhum dado para exportar",
          description: "Não há assinaturas cadastradas no sistema.",
          variant: "destructive",
        });
        return;
      }
      
      // Format the data for export
      const formattedData = data.map((item): SubscriptionData => ({
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
        icon: item.icon || '',
        addedDate: item.added_date
      }));
      
      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      
      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Assinaturas");
      
      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data_blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Save the file
      saveAs(data_blob, `assinaturas_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: "Exportação concluída",
        description: `${formattedData.length} assinaturas exportadas com sucesso.`,
        variant: "default",
      });
      
    } catch (error) {
      console.error('Error exporting subscriptions:', error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar as assinaturas. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleExport} 
      disabled={isLoading}
      variant="default"
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      {isLoading ? 'Exportando...' : 'Exportar Assinaturas'}
    </Button>
  );
};

export default ExportSubscriptions;
