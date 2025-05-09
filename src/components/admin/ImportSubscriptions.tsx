
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Upload, FileUp, Check, X, AlertTriangle, Info } from 'lucide-react';

interface ParsedSubscription {
  title: string;
  price: string;
  access?: string;
  status?: string;
  payment_method?: string;
  isValid: boolean;
  errors?: string[];
}

const ImportSubscriptions = () => {
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState<string>('');
  const [subscriptions, setSubscriptions] = useState<ParsedSubscription[]>([]);
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<number[]>([]);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/plain') {
      setFile(selectedFile);
      readFile(selectedFile);
    } else {
      setFile(null);
      toast({
        variant: "destructive",
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo TXT válido."
      });
    }
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawText(text);
      parseSubscriptions(text);
    };
    reader.readAsText(file);
  };

  const parseSubscriptions = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    const parsed = lines.map(line => {
      const parts = line.split('|').map(part => part.trim());
      const errors: string[] = [];
      
      // Basic validation
      if (parts.length < 2) {
        errors.push('Formato inválido, esperado pelo menos título e preço separados por |');
      }
      
      if (!parts[0]) {
        errors.push('Título é obrigatório');
      }
      
      if (!parts[1] || !parts[1].includes('R$')) {
        errors.push('Preço inválido, deve incluir R$');
      }
      
      const subscription: ParsedSubscription = {
        title: parts[0] || '',
        price: parts[1] || '',
        access: parts[2] || 'Não informado',
        payment_method: parts[3] || 'pix',
        status: parts[4] || 'disponível',
        isValid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined
      };
      
      return subscription;
    });
    
    setSubscriptions(parsed);
    
    const validCount = parsed.filter(s => s.isValid).length;
    toast({
      title: `${parsed.length} anúncios processados`,
      description: `${validCount} válidos e ${parsed.length - validCount} com erros.`,
      variant: validCount > 0 ? "default" : "destructive"
    });
  };

  const toggleSubscriptionSelection = (index: number) => {
    setSelectedSubscriptions(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const selectAllValidSubscriptions = () => {
    const validIndices = subscriptions
      .map((sub, index) => sub.isValid ? index : -1)
      .filter(index => index !== -1);
    
    setSelectedSubscriptions(validIndices);
  };

  const clearSelection = () => {
    setSelectedSubscriptions([]);
  };

  const importSelectedSubscriptions = async () => {
    if (selectedSubscriptions.length === 0) {
      toast({
        variant: "default",
        title: "Nenhum anúncio selecionado",
        description: "Por favor, selecione pelo menos um anúncio para importar."
      });
      return;
    }

    setIsImporting(true);
    
    try {
      const selectedSubs = selectedSubscriptions.map(index => subscriptions[index]);
      
      // Prepare data for Supabase
      const dataToInsert = selectedSubs.map(sub => ({
        title: sub.title,
        price: sub.price,
        access: sub.access || 'Não informado',
        payment_method: sub.payment_method || 'pix',
        status: sub.status || 'disponível',
        code: `SF${Math.floor(1000 + Math.random() * 9000)}`, // Generate a code
        header_color: '#3b82f6', // Default blue
        price_color: '#10b981', // Default green
        whatsapp_number: '55XXXXXXXXXX', // Placeholder
        telegram_username: '@username', // Placeholder
      }));
      
      // Insert into Supabase
      const { data, error } = await supabase
        .from('subscriptions')
        .insert(dataToInsert)
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Importação concluída",
        description: `${data.length} anúncios foram importados com sucesso para o site.`
      });
      
      // Reset selections
      setSelectedSubscriptions([]);
      setImportDialogOpen(false);
    } catch (error: any) {
      console.error("Error importing subscriptions:", error);
      toast({
        variant: "destructive",
        title: "Erro ao importar anúncios",
        description: error.message || "Ocorreu um erro ao importar os anúncios."
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Importar Anúncios de TXT</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Upload de Arquivo</CardTitle>
          <CardDescription>
            Selecione um arquivo TXT contendo os anúncios a serem importados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Input 
              type="file" 
              id="txt-upload"
              className="hidden"
              accept=".txt"
              onChange={handleFileChange}
            />
            <label 
              htmlFor="txt-upload" 
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded shadow cursor-pointer"
            >
              <Upload className="h-4 w-4" />
              Selecionar Arquivo TXT
            </label>
            {file && (
              <span className="text-gray-600 flex items-center gap-1">
                <FileUp className="h-4 w-4" />
                Arquivo: {file.name}
              </span>
            )}
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md border">
            <h3 className="font-medium flex items-center gap-1">
              <Info className="h-4 w-4 text-blue-500" />
              Formato esperado:
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Título | Preço | Acesso | Método de Pagamento | Status
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Exemplo: Netflix Premium | R$25,00 | 1 tela | pix | disponível
            </p>
          </div>
        </CardContent>
      </Card>

      {subscriptions.length > 0 && (
        <Card>
          <CardHeader className="border-b">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Anúncios Importados ({subscriptions.length})</CardTitle>
                <CardDescription>
                  {subscriptions.filter(s => s.isValid).length} válidos, {subscriptions.filter(s => !s.isValid).length} com erros
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={selectAllValidSubscriptions}
                  disabled={subscriptions.filter(s => s.isValid).length === 0}
                >
                  Selecionar válidos
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearSelection}
                  disabled={selectedSubscriptions.length === 0}
                >
                  Limpar seleção
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Sel.</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Acesso</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Válido</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((sub, index) => (
                  <TableRow 
                    key={index} 
                    className={!sub.isValid ? "bg-red-50" : (selectedSubscriptions.includes(index) ? "bg-blue-50" : "")}
                  >
                    <TableCell>
                      <input 
                        type="checkbox" 
                        checked={selectedSubscriptions.includes(index)} 
                        onChange={() => toggleSubscriptionSelection(index)}
                        disabled={!sub.isValid}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell>{sub.title}</TableCell>
                    <TableCell>{sub.price}</TableCell>
                    <TableCell>{sub.access || "-"}</TableCell>
                    <TableCell>{sub.payment_method || "-"}</TableCell>
                    <TableCell>{sub.status || "-"}</TableCell>
                    <TableCell className="text-right">
                      {sub.isValid ? (
                        <Check className="h-5 w-5 text-green-500 ml-auto" />
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <X className="h-5 w-5 text-red-500" />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Erros de validação</AlertDialogTitle>
                              </AlertDialogHeader>
                              <div className="py-2">
                                <ul className="list-disc pl-5 space-y-1">
                                  {sub.errors?.map((err, i) => (
                                    <li key={i} className="text-sm text-red-600">{err}</li>
                                  ))}
                                </ul>
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogAction>Ok</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <CardFooter className="border-t bg-gray-50 p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between w-full">
              <p className="text-sm text-gray-500 mb-2 sm:mb-0">
                {selectedSubscriptions.length} anúncios selecionados para importação
              </p>
              <AlertDialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button 
                    disabled={selectedSubscriptions.length === 0} 
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Publicar anúncios no site
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar importação</AlertDialogTitle>
                    <AlertDialogDescription>
                      Você está prestes a importar {selectedSubscriptions.length} anúncios para o site. Deseja continuar?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={importSelectedSubscriptions} disabled={isImporting}>
                      {isImporting ? 'Importando...' : 'Importar'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardFooter>
        </Card>
      )}

      {rawText && (
        <Card>
          <CardHeader>
            <CardTitle>Texto Original</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              readOnly
              value={rawText}
              className="min-h-[200px] resize-y font-mono text-sm"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImportSubscriptions;
