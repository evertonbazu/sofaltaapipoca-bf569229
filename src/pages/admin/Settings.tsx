
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { getSiteConfig, updateSiteConfig } from '@/services/subscription-service';
import { useAuth } from '@/contexts/AuthContext';

const Settings = () => {
  const [siteTitle, setSiteTitle] = useState("");
  const [siteSubtitle, setSubtitle] = useState("");
  const [contact, setContact] = useState("");
  const [appVersion, setAppVersion] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { authState } = useAuth();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        // Fetch each setting separately with the key parameter
        const titleData = await getSiteConfig('site_title');
        const subtitleData = await getSiteConfig('site_subtitle');
        const contactData = await getSiteConfig('contact_whatsapp');
        const versionData = await getSiteConfig('app_version');
        
        if (titleData) setSiteTitle(titleData);
        if (subtitleData) setSubtitle(subtitleData);
        if (contactData) setContact(contactData);
        if (versionData) setAppVersion(versionData);
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as configurações",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [toast]);
  
  const handleSaveGeneral = async () => {
    try {
      await updateSiteConfig('site_title', siteTitle);
      await updateSiteConfig('site_subtitle', siteSubtitle);
      await updateSiteConfig('app_version', appVersion);
      
      toast({
        title: "Sucesso",
        description: "Configurações gerais atualizadas com sucesso",
      });
    } catch (error) {
      console.error("Error updating general settings:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive",
      });
    }
  };
  
  const handleSaveContact = async () => {
    try {
      await updateSiteConfig('contact_whatsapp', contact);
      
      toast({
        title: "Sucesso",
        description: "Configurações de contato atualizadas com sucesso",
      });
    } catch (error) {
      console.error("Error updating contact settings:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações de contato",
        variant: "destructive",
      });
    }
  };
  
  const handleBackupData = async () => {
    // Implementar backup de dados no futuro
    toast({
      title: "Em desenvolvimento",
      description: "Esta funcionalidade estará disponível em breve",
    });
  };

  // Verify user is admin
  if (!authState.isAdmin) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
        <p>Você não tem permissão para acessar esta página.</p>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Configurações do Site</h1>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="contact">Contato</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="siteTitle">Título do Site</Label>
                  <Input
                    id="siteTitle"
                    value={siteTitle}
                    onChange={(e) => setSiteTitle(e.target.value)}
                    placeholder="Título do site"
                  />
                </div>
                
                <div>
                  <Label htmlFor="siteSubtitle">Subtítulo</Label>
                  <Input
                    id="siteSubtitle"
                    value={siteSubtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Subtítulo do site"
                  />
                </div>
                
                <div>
                  <Label htmlFor="appVersion">Versão do App</Label>
                  <Input
                    id="appVersion"
                    value={appVersion}
                    onChange={(e) => setAppVersion(e.target.value)}
                    placeholder="Exemplo: 2.1.0"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Formato sugerido: 2.1.0 (major.minor.patch)
                  </p>
                </div>
                
                <Button 
                  onClick={handleSaveGeneral}
                  disabled={loading}
                >
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="contact">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="whatsapp">WhatsApp de Contato</Label>
                  <Input
                    id="whatsapp"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Ex: 5511999999999"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Formato: código do país + DDD + número (ex: 5511999999999)
                  </p>
                </div>
                
                <Button 
                  onClick={handleSaveContact}
                  disabled={loading}
                >
                  Salvar Contato
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="backup">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Backup de Dados</h3>
              <p className="text-gray-500 mb-4">
                Faça um backup completo do banco de dados. Esta operação pode demorar
                alguns minutos dependendo da quantidade de dados.
              </p>
              
              <Button 
                onClick={handleBackupData}
                variant="outline"
              >
                Gerar Backup
              </Button>
              
              <Separator className="my-6" />
              
              <h3 className="text-lg font-medium mb-4">Restaurar Backup</h3>
              <p className="text-gray-500 mb-4">
                Atenção: Esta operação substituirá todos os dados atuais.
              </p>
              
              <div>
                <Label htmlFor="backup-file">Arquivo de Backup</Label>
                <Input id="backup-file" type="file" className="mt-2" />
              </div>
              
              <Button 
                className="mt-4"
                variant="destructive"
              >
                Restaurar Dados
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
