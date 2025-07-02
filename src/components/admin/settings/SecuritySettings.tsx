import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Loader2, Shield, Key, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export const SecuritySettings: React.FC = () => {
  const { toast } = useToast();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [maxLoginAttempts, setMaxLoginAttempts] = useState('5');
  const [passwordMinLength, setPasswordMinLength] = useState('8');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSecurity = async () => {
    setIsSaving(true);
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configurações de segurança salvas",
        description: "As configurações de segurança foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações de segurança.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Segurança
        </CardTitle>
        <CardDescription>
          Configure as políticas de segurança do sistema.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="two-factor">Autenticação de Dois Fatores</Label>
              <p className="text-sm text-muted-foreground">
                Exige um segundo fator de autenticação para acessos administrativos.
              </p>
            </div>
            <Switch 
              id="two-factor"
              checked={twoFactorEnabled}
              onCheckedChange={setTwoFactorEnabled}
            />
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="session-timeout" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timeout de Sessão (minutos)
              </Label>
              <Input 
                id="session-timeout" 
                type="number"
                value={sessionTimeout} 
                onChange={(e) => setSessionTimeout(e.target.value)}
                min="1"
                max="1440"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max-attempts" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Máximo de Tentativas de Login
              </Label>
              <Input 
                id="max-attempts" 
                type="number"
                value={maxLoginAttempts} 
                onChange={(e) => setMaxLoginAttempts(e.target.value)}
                min="1"
                max="10"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password-length" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Tamanho Mínimo da Senha
              </Label>
              <Input 
                id="password-length" 
                type="number"
                value={passwordMinLength} 
                onChange={(e) => setPasswordMinLength(e.target.value)}
                min="6"
                max="32"
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">Aviso de Segurança</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Alterações nas configurações de segurança afetarão todos os usuários do sistema. 
                  Certifique-se de que todos os administradores estejam cientes das mudanças.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveSecurity} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar Configurações de Segurança'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};