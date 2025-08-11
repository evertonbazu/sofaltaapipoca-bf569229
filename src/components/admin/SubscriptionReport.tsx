import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, FileText, Download, MessageCircle } from 'lucide-react';
import { getAllSubscriptions } from '@/services/subscription-service';
import { SubscriptionData } from '@/types/subscriptionTypes';

/**
 * Componente de relatório de assinaturas
 * @version 3.11.0
 */
const SubscriptionReport: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [reportData, setReportData] = useState<string[]>([]);
  const [whatsappReportData, setWhatsappReportData] = useState<SubscriptionData[]>([]);
  const { toast } = useToast();

  // Gerar relatório ordenado alfabeticamente
  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const subscriptions = await getAllSubscriptions();
      
      // Filtrar apenas assinaturas visíveis e ordenar alfabeticamente
      const visibleSubscriptions = subscriptions
        .filter((sub: SubscriptionData) => sub.visible !== false)
        .sort((a: SubscriptionData, b: SubscriptionData) => 
          a.title.toLowerCase().localeCompare(b.title.toLowerCase())
        );

      // Extrair apenas os títulos
      const titles = visibleSubscriptions.map((sub: SubscriptionData) => sub.title);
      setReportData(titles);

      // Gerar dados para relatório do WhatsApp (agora com dados completos)
      setWhatsappReportData(visibleSubscriptions);

      toast({
        title: "Relatório gerado",
        description: `${titles.length} assinaturas encontradas e ordenadas alfabeticamente.`,
      });
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: "Erro ao gerar relatório",
        description: "Não foi possível gerar o relatório das assinaturas.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

// Copiar relatório como texto
const downloadReport = async () => {
  if (reportData.length === 0) {
    toast({
      title: "Nenhum dado para copiar",
      description: "Gere o relatório primeiro antes de copiar.",
      variant: "destructive",
    });
    return;
  }

  const reportContent = [
    "RELATÓRIO DE ASSINATURAS DISPONÍVEIS",
    "====================================",
    "",
    `Data de geração: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
    `Total de assinaturas: ${reportData.length}`,
    "",
    "TÍTULOS EM ORDEM ALFABÉTICA:",
    "-----------------------------",
    "",
    ...reportData.map((title, index) => `${(index + 1).toString().padStart(3, '0')}. ${title}`),
    "",
    "====================================",
    "Relatório gerado automaticamente pelo sistema Só Falta a Pipoca"
  ].join('\n');

  try {
    await navigator.clipboard.writeText(reportContent);
    toast({
      title: "Relatório copiado",
      description: "Conteúdo copiado para a área de transferência.",
    });
  } catch (err) {
    console.error('Falha ao copiar para a área de transferência:', err);
    toast({
      title: "Falha ao copiar",
      description: "Não foi possível copiar o relatório. Tente novamente.",
      variant: "destructive",
    });
  }
};

// Copiar relatório do WhatsApp como texto
const downloadWhatsAppReport = async () => {
  if (whatsappReportData.length === 0) {
    toast({
      title: "Nenhum dado para copiar",
      description: "Gere o relatório primeiro antes de copiar.",
      variant: "destructive",
    });
    return;
  }

  const reportContent = [
    "*RELATÓRIO DE ASSINATURAS DISPONÍVEIS*",
    "===============================================",
    "",
    `Data de geração: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
    `Total de assinaturas: ${whatsappReportData.length}`,
    "",
    "DIVISÕES DISPONÍVEIS",
    "-----------------------------------------",
    "",
    ...whatsappReportData.map((sub) => [
      `*🖥 ${sub.title.toUpperCase()}*`,
      `🏦 ${sub.price} - ${sub.paymentMethod}`,
      `☎️ https://wa.me/${sub.whatsappNumber}`,
      ""
    ].join('\n')),
    "===============================================",
    "Relatório gerado automaticamente pelo sistema Só Falta a Pipoca",
    "https://sofaltaapipoca.lovable.app/"
  ].join('\n');

  try {
    await navigator.clipboard.writeText(reportContent);
    toast({
      title: "Relatório WhatsApp copiado",
      description: "Conteúdo copiado para a área de transferência.",
    });
  } catch (err) {
    console.error('Falha ao copiar para a área de transferência:', err);
    toast({
      title: "Falha ao copiar",
      description: "Não foi possível copiar o relatório. Tente novamente.",
      variant: "destructive",
    });
  }
};

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Relatório de Assinaturas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={generateReport} 
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Gerar Relatório
              </>
            )}
          </Button>
          
          <Button 
            variant="outline"
            onClick={downloadReport} 
            disabled={reportData.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Baixar como TXT
          </Button>

          <Button 
            variant="outline"
            onClick={downloadWhatsAppReport} 
            disabled={whatsappReportData.length === 0}
            className="flex items-center gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            Baixar como TXT Whats
          </Button>
        </div>

        {reportData.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">
              Prévia do Relatório ({reportData.length} itens):
            </h3>
            <div className="bg-gray-50 p-4 rounded-md max-h-60 overflow-y-auto">
              <ol className="list-decimal list-inside space-y-1 text-sm">
                {reportData.slice(0, 10).map((title, index) => (
                  <li key={index} className="text-gray-700">
                    {title}
                  </li>
                ))}
                {reportData.length > 10 && (
                  <li className="text-gray-500 italic">
                    ... e mais {reportData.length - 10} itens
                  </li>
                )}
              </ol>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionReport;
