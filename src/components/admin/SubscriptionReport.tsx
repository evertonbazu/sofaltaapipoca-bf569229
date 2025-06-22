
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, FileText, Download } from 'lucide-react';
import { getAllSubscriptions } from '@/services/subscription-service';
import { SubscriptionData } from '@/types/subscriptionTypes';

/**
 * Componente de relatório de assinaturas
 * @version 3.9.0
 */
const SubscriptionReport: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [reportData, setReportData] = useState<Array<{title: string, url: string}>>([]);
  const { toast } = useToast();

  // Função simples para encurtar URLs (simulação de encurtador)
  const shortenUrl = (fullUrl: string): string => {
    // Extrai apenas o ID da URL e cria um formato mais curto
    const id = fullUrl.split('/subscription/')[1];
    return `https://tinyurl.com/sf-${id?.substring(0, 8)}`;
  };

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

      // Extrair títulos e URLs
      const reportItems = visibleSubscriptions.map((sub: SubscriptionData) => ({
        title: sub.title,
        url: shortenUrl(`https://sofaltaapipoca.lovable.app/subscription/${sub.id}`)
      }));
      
      setReportData(reportItems);

      toast({
        title: "Relatório gerado",
        description: `${reportItems.length} assinaturas encontradas e ordenadas alfabeticamente.`,
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

  // Salvar relatório como arquivo .txt
  const downloadReport = () => {
    if (reportData.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Gere o relatório primeiro antes de fazer o download.",
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
      ...reportData.map((item, index) => 
        `${(index + 1).toString().padStart(3, '0')}. ${item.title} - ${item.url}`
      ),
      "",
      "====================================",
      "Relatório gerado automaticamente pelo sistema Só Falta a Pipoca"
    ].join('\n');

    // Criar e baixar o arquivo
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_assinaturas_${new Date().toISOString().split('T')[0]}.txt`;
    
    document.body.appendChild(link);
    link.click();
    
    // Limpeza
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);

    toast({
      title: "Relatório baixado",
      description: "O arquivo foi salvo em sua pasta de downloads.",
    });
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
        </div>

        {reportData.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">
              Prévia do Relatório ({reportData.length} itens):
            </h3>
            <div className="bg-gray-50 p-4 rounded-md max-h-60 overflow-y-auto">
              <ol className="list-decimal list-inside space-y-1 text-sm">
                {reportData.slice(0, 10).map((item, index) => (
                  <li key={index} className="text-gray-700">
                    {item.title} - {item.url}
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
