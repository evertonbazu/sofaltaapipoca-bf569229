import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { getSiteConfig, updateSiteConfig } from '@/services/subscription-service';
import { updateAutoPostingStatus, toBooleanSafe } from '@/utils/shareUtils';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Send, Info } from 'lucide-react';

export const IntegrationsSettings: React.FC = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingSend, setIsTestingSend] = useState(false);
  const [telegramBotToken, setTelegramBotToken] = useState("");
  const [telegramGroupId, setTelegramGroupId] = useState("");
  const [autoPostToTelegram, setAutoPostToTelegram] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const tgBotToken = await getSiteConfig('telegram_bot_token');
        const tgGroupId = await getSiteConfig('telegram_group_id');
        const autoPostTg = await getSiteConfig('auto_post_to_telegram');
        
        if (tgBotToken) setTelegramBotToken(tgBotToken);
        if (tgGroupId) setTelegramGroupId(tgGroupId);
        if (autoPostTg !== null) setAutoPostToTelegram(toBooleanSafe(autoPostTg));
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    };
    loadConfig();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSiteConfig('telegram_bot_token', telegramBotToken);
      await updateSiteConfig('telegram_group_id', telegramGroupId);
      await updateAutoPostingStatus(autoPostToTelegram);
      
      toast({
        title: "Integrações atualizadas",
        description: "As configurações de integração foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações de integração.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestTelegramSend = async () => {
    setIsTestingSend(true);
    try {
      const { data, error } = await supabase.functions.invoke('telegram-integration', {
        body: {
          action: 'send-telegram-test',
          botToken: telegramBotToken,
          groupId: telegramGroupId
        }
      });
      
      if (error || !data?.success) {
        throw new Error(data?.error || 'Erro ao enviar mensagem de teste');
      }
      
      toast({
        title: "Teste enviado com sucesso",
        description: "A mensagem de teste foi enviada para o grupo do Telegram.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao enviar mensagem de teste para o Telegram.",
        variant: "destructive",
      });
    } finally {
      setIsTestingSend(false);
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrações</CardTitle>
        <CardDescription>
          Configure integrações com serviços externos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Integração com Telegram</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Configure a integração para enviar novos anúncios automaticamente para um grupo do Telegram.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-post-telegram">Postar automaticamente no Telegram</Label>
                <p className="text-sm text-muted-foreground">
                  Envia automaticamente novos anúncios para o grupo do Telegram configurado.
                </p>
              </div>
              <Switch 
                id="auto-post-telegram"
                checked={autoPostToTelegram}
                onCheckedChange={setAutoPostToTelegram}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="telegram-bot-token">Token do Bot do Telegram</Label>
              <Input 
                id="telegram-bot-token" 
                value={telegramBotToken} 
                onChange={(e) => setTelegramBotToken(e.target.value)}
                placeholder="5921988686:AAHXpA6Wyre4BIGACaFLOqB6YrhTavIdbQQ"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Token de acesso do bot obtido através do BotFather.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="telegram-group-id">ID do Grupo/Canal</Label>
              <Input 
                id="telegram-group-id" 
                value={telegramGroupId} 
                onChange={(e) => setTelegramGroupId(e.target.value)}
                placeholder="-1001484207364"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                ID do grupo ou canal do Telegram onde as mensagens serão enviadas.
              </p>
            </div>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded text-sm">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                <div>
                  <p className="text-blue-700 font-medium">Dica para ID do grupo</p>
                  <p className="text-blue-600 mt-1">
                    Para grupos com ID começando com -100, você pode inserir apenas os números após -100.
                    Por exemplo, para "-100<strong>1484207364</strong>", você pode inserir apenas "<strong>1484207364</strong>".
                  </p>
                </div>
              </div>
            </div>
            
            <div className="pt-2">
              <Button 
                variant="outline" 
                onClick={handleTestTelegramSend}
                disabled={!telegramBotToken || !telegramGroupId || isTestingSend}
                className="flex items-center gap-2"
              >
                {isTestingSend ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Enviar Mensagem de Teste
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar Integrações'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};