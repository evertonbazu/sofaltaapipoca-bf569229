import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';

const ImportSubscriptions = () => {
  const [file, setFile] = useState<File | null>(null);
  const [subscriptions, setSubscriptions] = useState<string[]>([]);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/plain') {
      setFile(selectedFile);
    } else {
      setFile(null);
      toast({
        variant: "destructive",
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo TXT válido."
      });
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        variant: "default",
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um arquivo TXT para importar."
      });
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        setSubscriptions(lines);
        toast({
          title: "Anúncios importados",
          description: `${lines.length} anúncios foram importados com sucesso.`
        });
      };
      reader.readAsText(file);
    } catch (error) {
      console.error("Error reading file:", error);
      toast({
        variant: "destructive",
        title: "Erro ao importar anúncios",
        description: "Ocorreu um erro ao ler o arquivo. Por favor, tente novamente."
      });
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Importar Anúncios de TXT</h1>
      
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
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded shadow cursor-pointer"
        >
          Selecionar Arquivo TXT
        </label>
        {file && (
          <span className="text-gray-600">
            Arquivo selecionado: {file.name}
          </span>
        )}
      </div>

      <Button onClick={handleImport} disabled={!file}>
        Importar Anúncios
      </Button>

      {subscriptions.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Anúncios Importados:</h2>
          <Textarea
            readOnly
            value={subscriptions.join('\n')}
            className="min-h-[200px] resize-y"
          />
        </div>
      )}
    </div>
  );
};

export default ImportSubscriptions;
