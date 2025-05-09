
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { importSubscriptionsFromText } from '@/utils/importSubscriptions';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
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

const ImportBulkSubscriptions = () => {
  const [rawText, setRawText] = useState<string>('');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; errors: number } | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleImport = async () => {
    if (!rawText.trim()) {
      toast({
        variant: "destructive",
        title: "Nenhum texto fornecido",
        description: "Por favor, cole o texto com os anúncios a serem importados."
      });
      return;
    }

    setIsImporting(true);
    try {
      const result = await importSubscriptionsFromText(rawText);
      setImportResult(result);
      
      toast({
        title: "Importação concluída",
        description: `${result.success} anúncios importados com sucesso. ${result.errors} erros.`,
        variant: result.errors === 0 ? "default" : "destructive"
      });
      
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
      <h1 className="text-2xl font-bold">Importação em Massa de Anúncios</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Colar Anúncios do Telegram</CardTitle>
          <CardDescription>
            Cole o texto com múltiplos anúncios no formato do Telegram para importá-los de uma vez
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            className="h-[400px] resize-none font-mono text-sm"
            placeholder="Cole aqui os anúncios no formato do Telegram..."
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          />
          
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex gap-2 items-start">
              <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Formato esperado dos anúncios:</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Os anúncios devem seguir o formato padrão do Telegram, com emojis para cada campo:
                </p>
                <pre className="bg-white mt-2 p-3 rounded text-xs border border-yellow-200 overflow-x-auto">
                  {`🖥 TÍTULO DO ANÚNCIO
🏦 PREÇO - FORMA DE PAGAMENTO
📌 STATUS 
🔐 TIPO DE ACESSO
📩 @USUÁRIO_TELEGRAM
📱 LINK DO WHATSAPP`}
                </pre>
              </div>
            </div>
          </div>
          
          {importResult && (
            <div className={`mt-4 ${importResult.errors === 0 ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'} border rounded-md p-4`}>
              <div className="flex items-start gap-3">
                {importResult.errors === 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                )}
                <div>
                  <h4 className="font-medium">Resultado da importação</h4>
                  <ul className="mt-1 space-y-1 text-sm">
                    <li className="text-green-700">{importResult.success} anúncios importados com sucesso</li>
                    {importResult.errors > 0 && (
                      <li className="text-red-600">{importResult.errors} erros na importação</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <AlertDialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button 
                className="bg-green-600 hover:bg-green-700" 
                disabled={isImporting || !rawText.trim()}>
                Importar Anúncios
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar importação de anúncios</AlertDialogTitle>
                <AlertDialogDescription>
                  Você está prestes a importar múltiplos anúncios para o site. Esta ação não pode ser desfeita.
                  Deseja continuar?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleImport}
                  disabled={isImporting}>
                  {isImporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importando...
                    </>
                  ) : 'Confirmar importação'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ImportBulkSubscriptions;
