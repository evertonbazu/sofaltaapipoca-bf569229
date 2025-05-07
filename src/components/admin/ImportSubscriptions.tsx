
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { AlertTriangle, FileSpreadsheet, Upload, Check, Loader2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionData } from '@/types/subscriptionTypes';
import * as XLSX from 'xlsx';
import { useIsMobile } from '@/hooks/use-mobile';
import { parseTxtContent } from '@/utils/exportHelpers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ExcelSubscription {
  title: string;
  price: string;
  payment_method: string;
  status: string;
  access: string;
  whatsapp_number: string;
  telegram_username: string;
  header_color?: string;
  price_color?: string;
  icon?: string;
  added_date: string;
  pix_qr_code?: string;
  código?: number;
}

const ImportSubscriptions: React.FC = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<ExcelSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importType, setImportType] = useState<'excel' | 'txt'>('excel');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) {
      setFile(null);
      setPreviewData([]);
      return;
    }
    
    if (importType === 'excel' && !selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      setError('Por favor, selecione um arquivo Excel válido (.xlsx ou .xls)');
      setFile(null);
      setPreviewData([]);
      return;
    }
    
    if (importType === 'txt' && !selectedFile.name.endsWith('.txt')) {
      setError('Por favor, selecione um arquivo de texto válido (.txt)');
      setFile(null);
      setPreviewData([]);
      return;
    }
    
    setFile(selectedFile);
    setIsLoading(true);
    
    try {
      let data;
      if (importType === 'excel') {
        data = await readExcelFile(selectedFile);
      } else {
        data = await readTxtFile(selectedFile);
      }
      setPreviewData(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao processar o arquivo');
      setPreviewData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const readExcelFile = (file: File): Promise<ExcelSubscription[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          // Validate data structure
          const subscriptions = jsonData.map((row: any) => {
            // Map Excel columns to our data structure
            if (!row.title || !row.price || !row.payment_method || !row.status || 
                !row.access || !row.whatsapp_number || !row.telegram_username) {
              throw new Error('Formato do arquivo inválido. Verifique se todas as colunas necessárias estão presentes.');
            }
            
            return {
              title: row.title,
              price: row.price,
              payment_method: row.payment_method,
              status: row.status,
              access: row.access,
              whatsapp_number: row.whatsapp_number,
              telegram_username: row.telegram_username,
              header_color: row.header_color || 'bg-blue-600',
              price_color: row.price_color || 'text-blue-600',
              icon: row.icon || 'monitor',
              added_date: row.added_date || new Date().toLocaleDateString('pt-BR'),
              pix_qr_code: row.pix_qr_code || null,
              código: row.código || null
            };
          });
          
          resolve(subscriptions);
        } catch (err) {
          reject(err);
        }
      };
      
      reader.onerror = (err) => {
        reject(err);
      };
      
      reader.readAsBinaryString(file);
    });
  };

  const readTxtFile = (file: File): Promise<ExcelSubscription[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          
          // Parse the TXT content using the utility function
          const subscriptions = parseTxtContent(content);
          
          // Validate if any subscriptions were found
          if (subscriptions.length === 0) {
            throw new Error('Nenhum anúncio encontrado no arquivo. Verifique se o formato está correto.');
          }
          
          resolve(subscriptions);
        } catch (err) {
          reject(err);
        }
      };
      
      reader.onerror = (err) => {
        reject(err);
      };
      
      reader.readAsText(file);
    });
  };

  const handleImport = async () => {
    if (!previewData.length) return;
    
    try {
      setIsImporting(true);
      setError(null);
      
      // First get existing subscriptions
      const { data: existingSubscriptions, error: fetchError } = await supabase
        .from('subscriptions')
        .select('title, telegram_username');
      
      if (fetchError) throw fetchError;
      
      // Filter out duplicates
      const existingTitlesMap = new Map();
      existingSubscriptions.forEach((sub: any) => {
        const key = `${sub.title}-${sub.telegram_username}`.toLowerCase();
        existingTitlesMap.set(key, true);
      });
      
      const newSubscriptions = previewData.filter(sub => {
        const key = `${sub.title}-${sub.telegram_username}`.toLowerCase();
        return !existingTitlesMap.has(key);
      });
      
      if (newSubscriptions.length === 0) {
        toast({
          title: "Nenhum anúncio novo",
          description: "Todos os anúncios do arquivo já existem no sistema.",
        });
        setIsImporting(false);
        return;
      }
      
      // Insert new subscriptions
      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert(newSubscriptions.map(sub => ({
          title: sub.title,
          price: sub.price,
          payment_method: sub.payment_method,
          status: sub.status,
          access: sub.access,
          whatsapp_number: sub.whatsapp_number,
          telegram_username: sub.telegram_username,
          header_color: sub.header_color || 'bg-blue-600',
          price_color: sub.price_color || 'text-blue-600',
          icon: sub.icon || 'monitor',
          added_date: sub.added_date,
          pix_qr_code: sub.pix_qr_code,
          código: sub.código
        })));
      
      if (insertError) throw insertError;
      
      toast({
        title: "Importação bem-sucedida",
        description: `${newSubscriptions.length} anúncios foram importados com sucesso.`,
      });
      
      // Reset the form
      setFile(null);
      setPreviewData([]);
      
      // Reset the file input
      const fileInput = document.getElementById('import-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Erro na importação",
        description: err.message,
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-full">
      <div>
        <h1 className="text-3xl font-bold">Importar Anúncios</h1>
        <p className="text-muted-foreground mt-2">
          Faça upload de um arquivo Excel (.xlsx ou .xls) ou texto (.txt) para importar novos anúncios.
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md flex items-center gap-3">
          <AlertTriangle className="text-red-500" />
          <span className="text-red-600">{error}</span>
        </div>
      )}
      
      <Tabs defaultValue="excel" onValueChange={(value) => setImportType(value as 'excel' | 'txt')}>
        <TabsList className="mb-4">
          <TabsTrigger value="excel">Arquivo Excel</TabsTrigger>
          <TabsTrigger value="txt">Arquivo TXT</TabsTrigger>
        </TabsList>
        
        <TabsContent value="excel" className="border rounded-lg p-4 sm:p-6">
          <div className="flex flex-col items-center justify-center gap-4">
            <FileSpreadsheet className="h-16 w-16 text-green-500" />
            <h2 className="text-xl font-semibold">Selecione um arquivo Excel</h2>
            <p className="text-sm text-center text-muted-foreground max-w-md">
              O arquivo deve conter as colunas: title, price, payment_method, status, access, 
              whatsapp_number e telegram_username. Opcionalmente: header_color, price_color, icon, added_date, pix_qr_code e código.
            </p>
            
            <div className="w-full max-w-sm">
              <div className="relative mt-4">
                <input
                  type="file"
                  id="import-file"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                  disabled={importType !== 'excel'}
                />
                <Button
                  variant="outline"
                  className="w-full border-dashed border-2 h-24 sm:h-32"
                >
                  <div className="flex flex-col items-center">
                    <Upload className="h-6 w-6 mb-2" />
                    <span>Clique para selecionar ou arraste o arquivo</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      Apenas arquivos .xlsx ou .xls
                    </span>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="txt" className="border rounded-lg p-4 sm:p-6">
          <div className="flex flex-col items-center justify-center gap-4">
            <FileText className="h-16 w-16 text-blue-500" />
            <h2 className="text-xl font-semibold">Selecione um arquivo TXT</h2>
            <p className="text-sm text-center text-muted-foreground max-w-md">
              O arquivo deve estar no formato exportado pelo sistema. Cada anúncio deve começar com "=== ASSINATURA X ===" e terminar com ";".
            </p>
            
            <div className="w-full max-w-sm">
              <div className="relative mt-4">
                <input
                  type="file"
                  id="import-file"
                  accept=".txt"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                  disabled={importType !== 'txt'}
                />
                <Button
                  variant="outline"
                  className="w-full border-dashed border-2 h-24 sm:h-32"
                >
                  <div className="flex flex-col items-center">
                    <Upload className="h-6 w-6 mb-2" />
                    <span>Clique para selecionar ou arraste o arquivo</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      Apenas arquivos .txt
                    </span>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {file && (
        <div className="flex items-center gap-2 text-sm">
          <Check className="h-4 w-4 text-green-500" />
          <span>Arquivo selecionado: {file.name}</span>
        </div>
      )}
      
      {isLoading && (
        <div className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="mt-2 text-muted-foreground">Processando arquivo...</span>
        </div>
      )}
      
      {previewData.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Anúncios a serem importados</h3>
            <Button
              onClick={handleImport}
              disabled={isImporting}
            >
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Importar {previewData.length} Anúncios
                </>
              )}
            </Button>
          </div>
          
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telegram</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.price}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.payment_method}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.status}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.telegram_username}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.código || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportSubscriptions;
