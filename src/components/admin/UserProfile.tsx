
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

const UserProfile: React.FC = () => {
  const { toast } = useToast();
  const { authState } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!authState.session?.user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Get user profile from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authState.session.user.id)
          .single();
        
        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          setError("Não foi possível obter seus dados de perfil.");
          return;
        }
        
        if (profileData) {
          setUsername(profileData.username || '');
        }
        
        // Set email from the session
        if (authState.session?.user) {
          setEmail(authState.session.user.email || '');
        }
      } catch (err: any) {
        console.error("Error in fetchUserProfile:", err);
        setError(err.message || "Ocorreu um erro ao carregar seu perfil.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [authState.session, authState.user, toast]);

  const handleUpdateProfile = async () => {
    if (!authState.session?.user?.id) return;
    
    try {
      setIsSaving(true);
      setError(null);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          username
        })
        .eq('id', authState.session.user.id);
      
      if (error) throw error;
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso."
      });
      
    } catch (err: any) {
      setError(err.message || "Não foi possível atualizar seu perfil.");
      toast({
        variant: "destructive",
        title: "Erro ao atualizar perfil",
        description: err.message || "Não foi possível atualizar seu perfil."
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="mt-2 text-muted-foreground">Carregando perfil...</span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Meu Perfil</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Card className="max-w-md space-y-6">
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Nome de Usuário</Label>
            <Input 
              id="username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className="w-full"
              placeholder="Seu nome de usuário"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              disabled 
              className="w-full bg-gray-100"
            />
            <p className="text-xs text-muted-foreground">O email não pode ser alterado.</p>
          </div>
          
          <Button 
            onClick={handleUpdateProfile} 
            disabled={isSaving} 
            className="w-full"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : "Salvar Alterações"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
