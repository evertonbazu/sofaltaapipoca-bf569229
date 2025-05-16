
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getSiteConfig, updateSiteConfig } from '@/services/subscription-service';

const Settings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Configurações gerais
  const [siteName, setSiteName] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  
  // Configurações SEO
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState("");
  
  // Configurações de exibição
  const [showFeatured, setShowFeatured] = useState(true);
  const [showPricing, setShowPricing] = useState(true);
  const [showCategories, setShowCategories] = useState(true);

  // Carregar configurações do site
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const data = await getSiteConfig();
        
        // Processar os dados recebidos
        data.forEach((config: any) => {
          switch(config.key) {
            case 'site_name':
              setSiteName(config.value || '');
              break;
            case 'site_description':
              setSiteDescription(config.value || '');
              break;
            case 'contact_email':
              setContactEmail(config.value || '');
              break;
            case 'meta_title':
              setMetaTitle(config.value || '');
              break;
            case 'meta_description':
              setMetaDescription(config.value || '');
              break;
            case 'google_analytics_id':
              setGoogleAnalyticsId(config.value || '');
              break;
            case 'show_featured':
              setShowFeatured(config.value === 'true');
              break;
            case 'show_pricing':
              setShowPricing(config.value === 'true');
              break;
            case 'show_categories':
              setShowCategories(config.value === 'true');
              break;
            default:
              break;
          }
        });
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
    
    loadSettings();
  }, [toast]);

  // Salvar configurações gerais
  const saveGeneralSettings = async () => {
    setIsSaving(true);
    try {
      await updateSiteConfig('site_name', siteName);
      await updateSiteConfig('site_description', siteDescription);
      await updateSiteConfig('contact_email', contactEmail);
      
      toast({
        title: "Configurações salvas",
        description: "As configurações gerais foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar configurações gerais:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações gerais.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Salvar configurações de SEO
  const saveSeoSettings = async () => {
    setIsSaving(true);
    try {
      await updateSiteConfig('meta_title', metaTitle);
      await updateSiteConfig('meta_description', metaDescription);
      await updateSiteConfig('google_analytics_id', googleAnalyticsId);
      
      toast({
        title: "Configurações salvas",
        description: "As configurações de SEO foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar configurações de SEO:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações de SEO.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Salvar configurações de exibição
  const saveDisplaySettings = async () => {
    setIsSaving(true);
    try {
      await updateSiteConfig('show_featured', showFeatured.toString());
      await updateSiteConfig('show_pricing', showPricing.toString());
      await updateSiteConfig('show_categories', showCategories.toString());
      
      toast({
        title: "Configurações salvas",
        description: "As configurações de exibição foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar configurações de exibição:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações de exibição.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando configurações...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Configurações do Site</h2>
      
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="display">Exibição</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label htmlFor="site-name">Nome do site</Label>
                <Input 
                  id="site-name"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="Só Falta a Pipoca"
                />
              </div>
              
              <div>
                <Label htmlFor="site-description">Descrição do site</Label>
                <Textarea 
                  id="site-description"
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  placeholder="Seu guia para streamings e assinaturas"
                />
              </div>
              
              <div>
                <Label htmlFor="contact-email">Email de contato</Label>
                <Input 
                  id="contact-email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="contato@sofaltaapipoca.com"
                />
              </div>
              
              <Button 
                onClick={saveGeneralSettings} 
                disabled={isSaving}
                className="w-full md:w-auto"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar configurações
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="seo">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label htmlFor="meta-title">Meta título</Label>
                <Input 
                  id="meta-title"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Só Falta a Pipoca - Seu guia de streamings"
                />
              </div>
              
              <div>
                <Label htmlFor="meta-description">Meta descrição</Label>
                <Textarea 
                  id="meta-description"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="O melhor lugar para encontrar assinaturas de serviços de streaming"
                />
              </div>
              
              <div>
                <Label htmlFor="google-analytics">ID do Google Analytics</Label>
                <Input 
                  id="google-analytics"
                  value={googleAnalyticsId}
                  onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                  placeholder="GA-123456789"
                />
              </div>
              
              <Button 
                onClick={saveSeoSettings} 
                disabled={isSaving}
                className="w-full md:w-auto"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar configurações
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="display">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-featured">Mostrar assinaturas destacadas</Label>
                  <p className="text-sm text-gray-500">
                    Exibir seção de assinaturas destacadas na página inicial
                  </p>
                </div>
                <Switch 
                  id="show-featured"
                  checked={showFeatured}
                  onCheckedChange={setShowFeatured}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-pricing">Mostrar preços</Label>
                  <p className="text-sm text-gray-500">
                    Exibir preços das assinaturas para todos os usuários
                  </p>
                </div>
                <Switch 
                  id="show-pricing"
                  checked={showPricing}
                  onCheckedChange={setShowPricing}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-categories">Mostrar categorias</Label>
                  <p className="text-sm text-gray-500">
                    Organizar assinaturas por categorias na página inicial
                  </p>
                </div>
                <Switch 
                  id="show-categories"
                  checked={showCategories}
                  onCheckedChange={setShowCategories}
                />
              </div>
              
              <Button 
                onClick={saveDisplaySettings} 
                disabled={isSaving}
                className="w-full md:w-auto mt-4"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar configurações
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
