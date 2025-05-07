
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { AlertTriangle, FileText, Upload, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface TxtSubscription {
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
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<TxtSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) {
      setFile(null);
      setPreviewData([]);
      return;
    }
    
    if (!selectedFile.name.endsWith('.txt')) {
      setError('Por favor, selecione um arquivo de texto válido (.txt)');
      setFile(null);
      setPreviewData([]);
      return;
    }
    
    setFile(selectedFile);
    setIsLoading(true);
    
    try {
      const data = await readTxtFile(selectedFile);
      setPreviewData(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao processar o arquivo');
      setPreviewData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const readTxtFile = (file: File): Promise<TxtSubscription[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          
          // Parse the TXT content
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
  
  const parseTxtContent = (txtContent: string): TxtSubscription[] => {
    const subscriptions: TxtSubscription[] = [];
    const blocks = txtContent.split('\n\n');
    
    let currentSubscription: Partial<TxtSubscription> = {
      header_color: 'bg-blue-600',
      price_color: 'text-blue-600',
      icon: 'monitor'
    };
    
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i].trim();
      
      if (!block) continue;
      
      // Title (🖥)
      if (block.startsWith('🖥')) {
        // Start a new subscription
        if (Object.keys(currentSubscription).length > 3) {
          if (currentSubscription.title && currentSubscription.price) {
            subscriptions.push(currentSubscription as TxtSubscription);
          }
          currentSubscription = {
            header_color: 'bg-blue-600',
            price_color: 'text-blue-600',
            icon: 'monitor'
          };
        }
        currentSubscription.title = block.replace('🖥', '').trim();
      }
      // Price (🏦)
      else if (block.startsWith('🏦')) {
        const priceParts = block.replace('🏦', '').trim().split('-');
        if (priceParts.length > 1) {
          currentSubscription.price = priceParts[0].trim();
          currentSubscription.payment_method = priceParts[1].trim();
        } else {
          currentSubscription.price = priceParts[0].trim();
          currentSubscription.payment_method = 'PIX';
        }
      }
      // Status (📌)
      else if (block.startsWith('📌')) {
        currentSubscription.status = block.replace('📌', '').trim();
      }
      // Access (🔐)
      else if (block.startsWith('🔐')) {
        currentSubscription.access = block.replace('🔐', '').trim();
      }
      // WhatsApp (📱)
      else if (block.startsWith('📱')) {
        currentSubscription.whatsapp_number = block.replace('📱', '').trim();
      }
      // Telegram (📩)
      else if (block.startsWith('📩')) {
        currentSubscription.telegram_username = block.replace('📩', '').trim();
      }
      // Date (📅)
      else if (block.startsWith('📅')) {
        currentSubscription.added_date = block.replace('📅 Adicionado em:', '').trim();
      }
      // Code (Código)
      else if (block.toLowerCase().startsWith('código:')) {
        const codeMatch = block.match(/Código:\s*(\d+)/i);
        if (codeMatch && codeMatch[1]) {
          currentSubscription.código = parseInt(codeMatch[1].trim());
        }
      }
      
      // If at the end of the file, add the current subscription if it has required fields
      if (i === blocks.length - 1) {
        if (currentSubscription.title && currentSubscription.price) {
          subscriptions.push(currentSubscription as TxtSubscription);
        }
      }
    }
    
    return subscriptions;
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
        <h1 className="text-3xl font-bold">Importar Anúncios (TXT)</h1>
        <p className="text-muted-foreground mt-2">
          Faça upload de um arquivo TXT para importar novos anúncios no formato especificado.
        </p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md flex items-center gap-3">
          <AlertTriangle className="text-red-500" />
          <span className="text-red-600">{error}</span>
        </div>
      )}
      
      <Card className="border rounded-lg">
        <CardHeader>
          <CardTitle>Selecione um arquivo TXT</CardTitle>
          <CardDescription>
            O arquivo deve seguir o formato:
            <pre className="mt-2 p-2 bg-slate-50 rounded text-xs overflow-x-auto">
{`🖥 TÍTULO DO ANÚNCIO
🏦 PREÇO - MÉTODO
📌 STATUS
🔐 TIPO DE ACESSO
📱 WHATSAPP
📩 @TELEGRAM

📅 Adicionado em: DD/MM/AAAA`}
            </pre>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-4">
            <FileText className="h-16 w-16 text-blue-500" />
            
            <div className="w-full max-w-sm">
              <div className="relative mt-4">
                <input
                  type="file"
                  id="import-file"
                  accept=".txt"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
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
          
          {file && (
            <div className="flex items-center gap-2 text-sm mt-4">
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
        </CardContent>
      </Card>
      
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
