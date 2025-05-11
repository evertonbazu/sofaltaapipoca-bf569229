
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
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const Settings = () => {
  const { toast } = useToast();
  const [siteTitle, setSiteTitle] = useState("🍿 Só Falta a Pipoca");
  const [siteSubtitle, setSiteSubtitle] = useState("Assinaturas premium com preços exclusivos");
  const [contactWhatsapp, setContactWhatsapp] = useState("5513992077804");
  const [appVersion, setAppVersion] = useState("2.1.0");
  const [showFeaturedSection, setShowFeaturedSection] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  
  // Buscar configurações do banco de dados
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_configurations')
          .select('*');
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Mapear as configurações
          data.forEach(config => {
            switch(config.key) {
              case 'site_title':
                setSiteTitle(config.value || "🍿 Só Falta a Pipoca");
                break;
              case 'site_subtitle':
                setSiteSubtitle(config.value || "Assinaturas premium com preços exclusivos");
                break;
              case 'contact_whatsapp':
                setContactWhatsapp(config.value || "5513992077804");
                break;
              case 'app_version':
                setAppVersion(config.value || "2.1.0");
                break;
              case 'show_featured_section':
                setShowFeaturedSection(config.value === 'true');
                break;
              default:
                break;
            }
          });
        }
      } catch (error) {
        console.error('Erro ao buscar configurações:', error);
        toast({
          title: "Erro ao carregar configurações",
          description: "Não foi possível carregar as configurações do banco de dados.",
          variant: "destructive",
        });
      } finally {
        setIsFetching(false);
      }
    };
    
    fetchSettings();
  }, [toast]);

  const updateSetting = async (key: string, value: string | boolean) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('site_configurations')
        .update({ 
          value: typeof value === 'boolean' ? value.toString() : value,
          updated_at: new Date().toISOString()
        })
        .eq('key', key);
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error(`Erro ao atualizar configuração ${key}:`, error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGeneral = async () => {
    setIsLoading(true);
    
    try {
      // Atualizar todas as configurações gerais
      const results = await Promise.all([
        updateSetting('site_title', siteTitle),
        updateSetting('site_subtitle', siteSubtitle),
        updateSetting('contact_whatsapp', contactWhatsapp)
      ]);
      
      if (results.every(result => result)) {
        toast({
          title: "Configurações salvas",
          description: "As configurações gerais foram atualizadas com sucesso.",
        });
      } else {
        throw new Error("Falha ao salvar algumas configurações");
      }
    } catch (error) {
      console.error('Erro ao salvar configurações gerais:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as configurações gerais.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAppearance = async () => {
    setIsLoading(true);
    
    try {
      // Atualizar configuração de aparência
      const result = await updateSetting('show_featured_section', showFeaturedSection);
      
      if (result) {
        toast({
          title: "Aparência atualizada",
          description: "As configurações de aparência foram atualizadas com sucesso.",
        });
      } else {
        throw new Error("Falha ao salvar configurações de aparência");
      }
    } catch (error) {
      console.error('Erro ao salvar configurações de aparência:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as configurações de aparência.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveVersion = async () => {
    setIsLoading(true);
    
    try {
      // Atualizar versão do app
      const result = await updateSetting('app_version', appVersion);
      
      if (result) {
        toast({
          title: "Versão atualizada",
          description: `A versão do aplicativo foi atualizada para ${appVersion}.`,
        });
      } else {
        throw new Error("Falha ao atualizar versão");
      }
    } catch (error) {
      console.error('Erro ao atualizar versão:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar a versão do aplicativo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isFetching) {
    return (
      <AdminLayout title="Configurações">
        <div className="flex items-center justify-center p-8">
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
              <Button onClick={handleSaveGeneral} disabled={isLoading}>
                {isLoading ? (
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
                        value="#4F46E5" 
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
                        value="#10B981" 
                        className="w-full h-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveAppearance} disabled={isLoading}>
                {isLoading ? (
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
                  <Button 
                    onClick={handleSaveVersion} 
                    variant="outline"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
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
