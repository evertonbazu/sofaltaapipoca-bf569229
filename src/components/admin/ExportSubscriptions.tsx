
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, ArrowDown, FileSpreadsheet, Home, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { utils, writeFile } from 'xlsx';

interface Subscription {
  id: string;
  title: string;
  price: string;
  payment_method: string;
  status: string;
  access: string;
  whatsapp_number: string;
  telegram_username: string;
  added_date: string;
  checked: boolean;
}

const ExportSubscriptions: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [selectAll, setSelectAll] = useState<boolean>(false);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('added_date', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        const formattedData: Subscription[] = data.map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          payment_method: item.payment_method,
          status: item.status,
          access: item.access,
          whatsapp_number: item.whatsapp_number,
          telegram_username: item.telegram_username,
          added_date: item.added_date,
          checked: false
        }));
        
        setSubscriptions(formattedData);
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Erro ao carregar anúncios",
        description: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const handleCheckboxChange = (id: string) => {
    setSubscriptions(subscriptions.map(sub => 
      sub.id === id ? { ...sub, checked: !sub.checked } : sub
    ));
    
    // Update selectAll state based on if all items are now checked
    const allChecked = subscriptions.every(sub => 
      sub.id === id ? !sub.checked : sub.checked
    );
    setSelectAll(allChecked);
  };

  const handleSelectAllChange = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setSubscriptions(subscriptions.map(sub => ({
      ...sub,
      checked: newSelectAll
    })));
  };

  const exportToExcel = () => {
    try {
      setIsExporting(true);
      
      // Filter only selected subscriptions
      const selectedSubscriptions = subscriptions.filter(sub => sub.checked);
      
      if (selectedSubscriptions.length === 0) {
        toast({
          variant: "warning",
          title: "Nenhum anúncio selecionado",
          description: "Por favor, selecione ao menos um anúncio para exportar."
        });
        setIsExporting(false);
        return;
      }
      
      // Format data for Excel export
      const excelData = selectedSubscriptions.map(sub => {
        // Format each subscription as requested
        return {
          "Anúncio": `🖥 ${sub.title} ${sub.payment_method ? `(${sub.payment_method})` : ''}\n🏦 ${sub.price}\n 📌${sub.status}\n🔐 ${sub.access}\n📩${sub.telegram_username}\n📱 https://wa.me/${sub.whatsapp_number}\n\n📅 Adicionado em: ${sub.added_date}`
        };
      });
      
      // Create a worksheet
      const worksheet = utils.json_to_sheet(excelData);
      
      // Set column width
      const colWidth = [{ wch: 80 }];
      worksheet['!cols'] = colWidth;
      
      // Create a workbook
      const workbook = utils.book_new();
      utils.book_append_sheet(workbook, worksheet, "Anúncios");
      
      // Generate Excel file
      writeFile(workbook, "anuncios_so_falta_a_pipoca.xlsx");
      
      toast({
        title: "Exportação concluída",
        description: `${selectedSubscriptions.length} anúncios exportados com sucesso.`
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro ao exportar anúncios",
        description: err.message
      });
    } finally {
      setIsExporting(false);
    }
  };

  const filteredSubscriptions = searchTerm
    ? subscriptions.filter(sub => 
        sub.title.toLowerCase().includes(searchTerm) || 
        sub.price.toLowerCase().includes(searchTerm) ||
        sub.payment_method.toLowerCase().includes(searchTerm) ||
        sub.telegram_username.toLowerCase().includes(searchTerm)
      )
    : subscriptions;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Exportar Anúncios</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate('/')} 
            className="flex gap-2"
          >
            <Home className="h-5 w-5" />
            Início
          </Button>
          <Button 
            onClick={exportToExcel} 
            className="flex gap-2"
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <FileSpreadsheet className="h-5 w-5" />
                Exportar Selecionados
              </>
            )}
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md flex items-center gap-3 mb-6">
          <AlertTriangle className="text-red-500" />
          <span className="text-red-600">{error}</span>
        </div>
      )}
      
      <div className="mb-6">
        <Input
          placeholder="Pesquisar anúncios..."
          value={searchTerm}
          onChange={handleSearch}
          className="max-w-md"
        />
      </div>
      
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={filteredSubscriptions.length > 0 && selectAll} 
                  onCheckedChange={handleSelectAllChange}
                  disabled={filteredSubscriptions.length === 0}
                />
              </TableHead>
              <TableHead className="w-[300px]">Título</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="hidden lg:table-cell">Data</TableHead>
              <TableHead className="hidden md:table-cell">Telegram</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="mt-2 text-muted-foreground">Carregando anúncios...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredSubscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {searchTerm ? "Nenhum resultado encontrado" : "Nenhum anúncio cadastrado"}
                </TableCell>
              </TableRow>
            ) : (
              filteredSubscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <Checkbox 
                      checked={subscription.checked} 
                      onCheckedChange={() => handleCheckboxChange(subscription.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {subscription.title}
                  </TableCell>
                  <TableCell>{subscription.price}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {subscription.status}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {subscription.added_date}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {subscription.telegram_username}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="mt-6 bg-gray-50 rounded-lg p-4 border">
        <h3 className="text-lg font-semibold mb-2">Formato de Exportação</h3>
        <div className="bg-gray-100 p-3 rounded whitespace-pre-line text-sm font-mono">
          🖥 NOME DO SERVIÇO (Tipo)<br/>
          🏦 VALOR<br/>
          📌STATUS<br/>
          🔐 TIPO DE ACESSO<br/>
          📩@USUÁRIO_TELEGRAM<br/>
          📱 https://wa.me/NUMERO_WHATSAPP<br/><br/>
          📅 Adicionado em: DATA
        </div>
      </div>
    </div>
  );
};

export default ExportSubscriptions;
