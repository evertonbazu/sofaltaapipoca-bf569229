import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getSiteConfig, updateSiteConfig } from '@/services/subscription-service';

export const GeneralSettings: React.FC = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [siteTitle, setSiteTitle] = useState("🍿 Só Falta a Pipoca");
  const [siteSubtitle, setSiteSubtitle] = useState("Assinaturas premium com preços exclusivos");
  const [contactWhatsapp, setContactWhatsapp] = useState("5513992077804");

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const title = await getSiteConfig('site_title');
        const subtitle = await getSiteConfig('site_subtitle');
        const whatsapp = await getSiteConfig('contact_whatsapp');
        
        if (title) setSiteTitle(title);
        if (subtitle) setSiteSubtitle(subtitle);
        if (whatsapp) setContactWhatsapp(whatsapp);
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    };
    loadConfig();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSiteConfig('site_title', siteTitle);
      await updateSiteConfig('site_subtitle', siteSubtitle);
      await updateSiteConfig('contact_whatsapp', contactWhatsapp);
      
      toast({
        title: "Configurações salvas",
        description: "As configurações gerais foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações Gerais</CardTitle>
        <CardDescription>
          Configure as informações básicas do site.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="site-title">Título do Site</Label>
          <Input 
            id="site-title" 
            value={siteTitle} 
            onChange={(e) => setSiteTitle(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="site-subtitle">Subtítulo do Site</Label>
          <Input 
            id="site-subtitle" 
            value={siteSubtitle} 
            onChange={(e) => setSiteSubtitle(e.target.value)}
          />
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-2">
          <Label htmlFor="contact-whatsapp">WhatsApp para Contato</Label>
          <div className="flex items-center">
            <span className="bg-muted px-3 py-2 text-muted-foreground border border-r-0 border-border rounded-l-md">
              +
            </span>
            <Input 
              id="contact-whatsapp" 
              value={contactWhatsapp} 
              onChange={(e) => setContactWhatsapp(e.target.value)}
              className="rounded-l-none"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Número completo com código do país e DDD, sem espaços ou caracteres especiais.
          </p>
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
            'Salvar Alterações'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};