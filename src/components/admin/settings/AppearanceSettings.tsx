import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { getSiteConfig, updateSiteConfig } from '@/services/subscription-service';
import { toBooleanSafe } from '@/utils/shareUtils';

export const AppearanceSettings: React.FC = () => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [showFeaturedSection, setShowFeaturedSection] = useState(true);
  const [primaryColor, setPrimaryColor] = useState("#4F46E5");
  const [secondaryColor, setSecondaryColor] = useState("#10B981");

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const featuredSection = await getSiteConfig('show_featured_section');
        const primary = await getSiteConfig('primary_color');
        const secondary = await getSiteConfig('secondary_color');
        
        if (featuredSection !== null) setShowFeaturedSection(toBooleanSafe(featuredSection));
        if (primary) setPrimaryColor(primary);
        if (secondary) setSecondaryColor(secondary);
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    };
    loadConfig();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSiteConfig('show_featured_section', showFeaturedSection.toString());
      await updateSiteConfig('primary_color', primaryColor);
      await updateSiteConfig('secondary_color', secondaryColor);
      
      toast({
        title: "Aparência atualizada",
        description: "As configurações de aparência foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações de aparência.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  return (
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
            <p className="text-sm text-muted-foreground">
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
        <Button onClick={handleSave} disabled={isSaving}>
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
  );
};