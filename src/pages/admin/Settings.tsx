
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { getSiteConfig, updateSiteConfig } from '@/services/subscription-service';
import { Loader2 } from 'lucide-react';

const Settings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [siteTitle, setSiteTitle] = useState("🍿 Só Falta a Pipoca");
  const [siteSubtitle, setSiteSubtitle] = useState("Assinaturas premium com preços exclusivos");
  const [contactWhatsapp, setContactWhatsapp] = useState("5513992077804");
  const [appVersion, setAppVersion] = useState("2.1.0");
  const [showFeaturedSection, setShowFeaturedSection] = useState(true);
  const [primaryColor, setPrimaryColor] = useState("#4F46E5");
  const [secondaryColor, setSecondaryColor] = useState("#10B981");
  
  // Carregar configurações do site ao montar o componente
  useEffect(() => {
    const loadSiteConfigurations = async () => {
      setIsLoading(true);
      try {
        // Carregar configurações do site
        const title = await getSiteConfig('site_title');
        const subtitle = await getSiteConfig('site_subtitle');
        const whatsapp = await getSiteConfig('contact_whatsapp');
        const version = await getSiteConfig('app_version');
        const featuredSection = await getSiteConfig('show_featured_section');
        const primary = await getSiteConfig('primary_color');
        const secondary = await getSiteConfig('secondary_color');
        
        // Atualizar estado com valores do banco de dados
        if (title) setSiteTitle(title);
        if (subtitle) setSiteSubtitle(subtitle);
        if (whatsapp) setContactWhatsapp(whatsapp);
        if (version) setAppVersion(version);
        if (featuredSection) setShowFeaturedSection(featuredSection === 'true');
        if (primary) setPrimaryColor(primary);
        if (secondary) setSecondaryColor(secondary);
        
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as configurações do site.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSiteConfigurations();
  }, [toast]);
  
  const handleSaveGeneral = async () => {
    setIsSaving(true);
    try {
      // Salvar configurações gerais
      await updateSiteConfig('site_title', siteTitle);
      await updateSiteConfig('site_subtitle', siteSubtitle);
      await updateSiteConfig('contact_whatsapp', contactWhatsapp);
      
      toast({
        title: "Configurações salvas",
        description: "As configurações gerais foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAppearance = async () => {
    setIsSaving(true);
    try {
      // Salvar configurações de aparência
      await updateSiteConfig('show_featured_section', showFeaturedSection.toString());
      await updateSiteConfig('primary_color', primaryColor);
      await updateSiteConfig('secondary_color', secondaryColor);
      
      toast({
        title: "Aparência atualizada",
        description: "As configurações de aparência foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar aparência:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações de aparência.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSaveVersion = async () => {
    setIsSaving(true);
    try {
      // Salvar versão do aplicativo
      await updateSiteConfig('app_version', appVersion);
      
      toast({
        title: "Versão atualizada",
        description: `A versão do aplicativo foi atualizada para ${appVersion}.`,
      });
    } catch (error) {
      console.error('Erro ao salvar versão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a versão do aplicativo.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <AdminLayout title="Configurações">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Carregando configurações...</span>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout title="Configurações">
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="appearance">Aparência</TabsTrigger>
          <TabsTrigger value="advanced">Avançado</TabsTrigger>
        </TabsList>
        
        {/* Configurações Gerais */}
        <TabsContent value="general">
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
                  <span className="bg-gray-100 px-3 py-2 text-gray-600 border border-r-0 border-gray-300 rounded-l-md">
                    +
                  </span>
                  <Input 
                    id="contact-whatsapp" 
                    value={contactWhatsapp} 
                    onChange={(e) => setContactWhatsapp(e.target.value)}
                    className="rounded-l-none"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Número completo com código do país e DDD, sem espaços ou caracteres especiais.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveGeneral} disabled={isSaving}>
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
        </TabsContent>
        
        {/* Configurações de Aparência */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
              <CardDescription>
                Personalize a aparência e o layout do site.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="featured-section">Mostrar Seção de Destaques</Label>
                  <p className="text-sm text-gray-500">
                    Exibe os anúncios destacados no topo da página inicial.
                  </p>
                </div>
                <Switch 
                  id="featured-section"
                  checked={showFeaturedSection}
                  onCheckedChange={setShowFeaturedSection}
                />
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <Label>Cores do Site</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primary-color" className="text-xs">Cor Primária</Label>
                    <div className="flex mt-1">
                      <Input 
                        id="primary-color" 
                        type="color" 
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)} 
                        className="w-full h-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="secondary-color" className="text-xs">Cor Secundária</Label>
                    <div className="flex mt-1">
                      <Input 
                        id="secondary-color" 
                        type="color" 
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-full h-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveAppearance} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Aparência'
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Configurações Avançadas */}
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Avançadas</CardTitle>
              <CardDescription>
                Configure opções avançadas do sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
              
              <div className="space-y-2">
                <Label className="text-red-500 font-medium">Zona de Perigo</Label>
                <div className="space-y-2">
                  <Button variant="destructive" className="w-full">
                    Limpar Cache do Sistema
                  </Button>
                  <Button variant="destructive" className="w-full">
                    Redefinir Configurações
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default Settings;
