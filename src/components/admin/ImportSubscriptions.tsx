
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Upload, Check, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { generateSubscriptionCode } from '@/utils/codeGenerator';

const ImportSubscriptions = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    total: number;
    success: number;
    errors: Array<{ row: number; error: string }>;
  } | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResults(null);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        title: 'NETFLIX PREMIUM',
        price: 'R$ 25,00 - PIX (Mensal)',
        payment_method: 'PIX (Mensal)',
        status: 'Assinado (2 vagas)',
        access: 'LOGIN E SENHA',
        header_color: 'bg-red-600',
        price_color: 'text-red-600',
        whatsapp_number: '5511999999999',
        telegram_username: '@usuario_telegram',
        icon: 'tv',
        added_date: '01/05/2025',
        featured: 'false',
      },
      {
        title: 'SPOTIFY PREMIUM',
        price: 'R$ 7,50 - PIX (Mensal)',
        payment_method: 'PIX (Mensal)',
        status: 'Assinado (1 vaga)',
        access: 'CONVITE POR E-MAIL',
        header_color: 'bg-green-600',
        price_color: 'text-green-600',
        whatsapp_number: '5511888888888',
        telegram_username: '@outro_usuario',
        icon: 'music',
        added_date: '02/05/2025',
        featured: 'true',
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Modelo");
    
    // Generate file and trigger download
    XLSX.writeFile(wb, "modelo_importacao_anuncios.xlsx");
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um arquivo Excel para importar."
      });
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(ws);

      if (jsonData.length === 0) {
        throw new Error("O arquivo não contém dados para importar.");
      }

      const results = {
        total: jsonData.length,
        success: 0,
        errors: [] as Array<{ row: number; error: string }>
      };

      for (let i = 0; i < jsonData.length; i++) {
        try {
          const row = jsonData[i] as any;

          // Basic validation
          if (!row.title || !row.price || !row.status || !row.access) {
            results.errors.push({
              row: i + 2, // Excel rows start at 1, and there's a header
              error: "Campos obrigatórios ausentes (título, preço, status ou acesso)"
            });
            continue;
          }

          // Process date
          let dateValue;
          if (row.added_date) {
            if (typeof row.added_date === 'string' && row.added_date.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
              // Convert DD/MM/YYYY to YYYY-MM-DD
              const parts = row.added_date.split('/');
              dateValue = `${parts[2]}-${parts[1]}-${parts[0]}`;
            } else {
              // Try to handle Excel date number
              try {
                const excelDate = XLSX.SSF.parse_date_code(row.added_date);
                dateValue = `${excelDate.y}-${String(excelDate.m).padStart(2, '0')}-${String(excelDate.d).padStart(2, '0')}`;
              } catch {
                // Use current date if can't parse
                dateValue = new Date().toISOString().split('T')[0];
              }
            }
          } else {
            // Default to current date if no date provided
            dateValue = new Date().toISOString().split('T')[0];
          }

          // Generate unique code
          const code = row.code || generateSubscriptionCode('SF', 5, Math.floor(Math.random() * 999) + 1);

          // Format featured as boolean
          const featured = row.featured === 'true' || row.featured === true;

          const { error } = await supabase.from('subscriptions').insert({
            title: row.title,
            price: row.price,
            payment_method: row.payment_method || row.price.split(' - ')[1] || 'PIX (Mensal)',
            status: row.status,
            access: row.access,
            header_color: row.header_color || 'bg-blue-600',
            price_color: row.price_color || 'text-blue-600',
            whatsapp_number: row.whatsapp_number,
            telegram_username: row.telegram_username,
            icon: row.icon || 'tv',
            added_date: dateValue,
            featured: featured,
            code: code
          });

          if (error) {
            results.errors.push({
              row: i + 2,
              error: error.message
            });
          } else {
            results.success++;
          }
        } catch (error: any) {
          results.errors.push({
            row: i + 2,
            error: error.message || "Erro desconhecido"
          });
        }
      }

      setResults(results);

      if (results.errors.length === 0) {
        toast({
          title: "Importação concluída",
          description: `${results.success} anúncios foram importados com sucesso.`,
        });
      } else {
        toast({
          variant: "warning",
          title: "Importação concluída com avisos",
          description: `${results.success} de ${results.total} anúncios foram importados. ${results.errors.length} erros encontrados.`,
        });
      }
    } catch (error: any) {
      console.error("Import error:", error);
      toast({
        variant: "destructive",
        title: "Erro na importação",
        description: error.message || "Ocorreu um erro ao processar o arquivo."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Importar Anúncios</h1>
        <Button onClick={downloadTemplate} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download Modelo
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="max-w-md"
            />
            <Button 
              onClick={handleImport}
              disabled={!file || isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Importar
                </>
              )}
            </Button>
          </div>
          
          {file && (
            <p className="text-sm text-gray-500">
              Arquivo selecionado: {file.name}
            </p>
          )}
          
          {results && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-2 text-lg font-medium">
                <Check className="h-5 w-5 text-green-500" />
                Importação concluída
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-gray-500 text-sm">Total de anúncios</div>
                  <div className="text-xl font-medium">{results.total}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-md">
                  <div className="text-green-700 text-sm">Importados com sucesso</div>
                  <div className="text-xl font-medium text-green-600">{results.success}</div>
                </div>
                <div className={`${results.errors.length > 0 ? 'bg-red-50' : 'bg-gray-50'} p-4 rounded-md`}>
                  <div className={`${results.errors.length > 0 ? 'text-red-600' : 'text-gray-500'} text-sm`}>Erros</div>
                  <div className={`text-xl font-medium ${results.errors.length > 0 ? 'text-red-600' : ''}`}>
                    {results.errors.length}
                  </div>
                </div>
              </div>
              
              {results.errors.length > 0 && (
                <div className="border border-red-200 rounded-md overflow-hidden mt-4">
                  <div className="bg-red-50 p-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <h3 className="font-medium text-red-800">Erros encontrados</h3>
                  </div>
                  <div className="divide-y">
                    {results.errors.map((error, index) => (
                      <div key={index} className="p-3 text-sm">
                        <strong>Linha {error.row}:</strong> {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mt-6">
            <h3 className="font-medium text-blue-800 mb-2">Instruções</h3>
            <ul className="list-disc pl-5 space-y-1 text-blue-700 text-sm">
              <li>O arquivo deve estar no formato Excel (.xlsx ou .xls)</li>
              <li>A primeira linha deve conter os nomes das colunas</li>
              <li>Colunas obrigatórias: título, preço, status e acesso</li>
              <li>Baixe o modelo para ver o formato esperado</li>
              <li>As datas devem estar no formato DD/MM/AAAA</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportSubscriptions;
