
import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { parseMultipleSubscriptionTexts, convertToSubscriptionFormat } from '@/utils/parseSubscriptionText';
import { supabase } from '@/integrations/supabase/client';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

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

      // Ensure each subscription has all required fields
      for (const sub of formattedSubscriptions) {
        if (!sub.title || !sub.price || !sub.status || !sub.access || 
            !sub.header_color || !sub.price_color || !sub.whatsapp_number || 
            !sub.telegram_username || !sub.code) {
          throw new Error('Missing required fields in some subscriptions');
        }
      }

      // First, remove all existing subscriptions
      await supabase.from('subscriptions').delete().neq('id', '0');
      
      // Then insert the new ones one by one to avoid type errors
      let addedCount = 0;
      let errorCount = 0;
      
      for (const subscription of formattedSubscriptions) {
        const { error } = await supabase
          .from('subscriptions')
          .insert({
            title: subscription.title,
            price: subscription.price,
            payment_method: subscription.payment_method || 'PIX',
            status: subscription.status,
            access: subscription.access,
            header_color: subscription.header_color,
            price_color: subscription.price_color,
            whatsapp_number: subscription.whatsapp_number,
            telegram_username: subscription.telegram_username,
            icon: subscription.icon || 'tv',
            code: subscription.code,
            added_date: subscription.added_date
          });
        
        if (error) {
          console.error('Error inserting subscription:', error);
          errorCount++;
        } else {
          addedCount++;
        }
      }
      
      toast({
        title: "Importação concluída",
        description: `${addedCount} anúncios foram importados com sucesso. ${errorCount} falhas.`
      });
      setText('');
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Como importar anúncios do Telegram
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-2">
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
        </CardContent>
      </Card>

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
          className="bg-blue-600 hover:bg-blue-700"
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
