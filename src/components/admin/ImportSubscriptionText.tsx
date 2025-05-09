
import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { parseMultipleSubscriptionTexts, convertToSubscriptionFormat } from '@/utils/parseSubscriptionText';
import { replaceAllSubscriptions } from '@/data/subscriptions';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

const ImportSubscriptionText: React.FC = () => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [parsedCount, setParsedCount] = useState(0);
  const { toast } = useToast();

  const handleParseAndPreview = () => {
    try {
      const parsedSubscriptions = parseMultipleSubscriptionTexts(text);
      setParsedCount(parsedSubscriptions.length);
      setIsDialogOpen(true);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao processar texto",
        description: error.message || "Não foi possível analisar o texto fornecido."
      });
    }
  };

  const handleConfirmImport = async () => {
    try {
      setIsLoading(true);
      const parsedSubscriptions = parseMultipleSubscriptionTexts(text);
      const formattedSubscriptions = parsedSubscriptions.map(convertToSubscriptionFormat);

      const result = await replaceAllSubscriptions(formattedSubscriptions);
      
      if (result.success) {
        toast({
          title: "Importação concluída",
          description: `${parsedSubscriptions.length} anúncios foram importados com sucesso.`
        });
        setText('');
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro na importação",
        description: error.message || "Ocorreu um erro durante a importação."
      });
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Importar Anúncios do Telegram</h1>
      <p className="text-gray-600">
        Cole o texto dos anúncios do Telegram abaixo. O formato deve ser como este exemplo:
      </p>
      <div className="bg-gray-100 p-4 rounded-md text-sm">
        <pre className="whitespace-pre-wrap">
          {`ANÚNCIOS SÓ FALTA A PIPOCA 🍿, [09/04/2025 09:21]
🖥 PARAMOUNT PADRÃO (MELI+)
🏦 R$ 6,00 - PIX (Mensal)
📌Assinado (2 vagas)
🔐 LOGIN E SENHA
📩@Eduardok10cds
📱 https://wa.me/5575999997951`}
        </pre>
      </div>

      <Textarea
        placeholder="Cole o texto dos anúncios aqui..."
        className="min-h-[400px] font-mono"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="flex justify-end space-x-2">
        <Button 
          variant="outline"
          onClick={() => setText('')}
          disabled={isLoading || !text}
        >
          Limpar
        </Button>
        <Button 
          onClick={handleParseAndPreview}
          disabled={isLoading || !text}
        >
          Importar Anúncios
        </Button>
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Importação</AlertDialogTitle>
            <AlertDialogDescription>
              Foram encontrados {parsedCount} anúncios no texto. Esta ação irá substituir TODOS os anúncios atuais pelos novos. Esta operação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmImport}
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {isLoading ? "Importando..." : "Confirmar Importação"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ImportSubscriptionText;
