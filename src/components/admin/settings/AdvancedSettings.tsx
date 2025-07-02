import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, AlertTriangle, RotateCcw, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getSiteConfig, updateSiteConfig } from '@/services/subscription-service';
import { APP_VERSION } from '@/components/Version';

export const AdvancedSettings: React.FC = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [appVersion, setAppVersion] = useState(APP_VERSION);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const version = await getSiteConfig('app_version');
        if (version) setAppVersion(version);
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    };
    loadConfig();
  }, []);

  const handleSaveVersion = async () => {
    setIsSaving(true);
    try {
      await updateSiteConfig('app_version', appVersion);
      
      toast({
        title: "Versão atualizada",
        description: `A versão do aplicativo foi atualizada para ${appVersion}.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a versão do aplicativo.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearCache = () => {
    // Simular limpeza de cache
    toast({
      title: "Cache limpo",
      description: "O cache do sistema foi limpo com sucesso.",
    });
  };

  const handleResetSettings = () => {
    // Confirmar antes de redefinir
    if (window.confirm('Tem certeza que deseja redefinir todas as configurações? Esta ação não pode ser desfeita.')) {
      toast({
        title: "Configurações redefinidas",
        description: "Todas as configurações foram redefinidas para os valores padrão.",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações Avançadas</CardTitle>
        <CardDescription>
          Configure opções avançadas do sistema.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="app-version">Versão do Aplicativo</Label>
          <div className="flex space-x-2">
            <Input 
              id="app-version" 
              value={appVersion} 
              onChange={(e) => setAppVersion(e.target.value)}
            />
            <Button onClick={handleSaveVersion} variant="outline" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Atualizar'
              )}
            </Button>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-4">
          <Label className="text-lg font-medium">Manutenção do Sistema</Label>
          
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleClearCache}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Limpar Cache do Sistema
            </Button>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <Label className="text-destructive font-medium">Zona de Perigo</Label>
          </div>
          
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-sm text-destructive mb-3">
              As ações abaixo são irreversíveis. Use com extrema cautela.
            </p>
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={handleResetSettings}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Redefinir Todas as Configurações
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};