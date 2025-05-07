
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

const UserProfile: React.FC = () => {
  const { toast } = useToast();
  const { authState } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  
  useEffect(() => {
    if (authState.user) {
      setUsername(authState.user.username || '');
      // Get email from the session object instead
      if (authState.session?.user) {
        setEmail(authState.session.user.email || '');
      }
    }
  }, [authState.user, authState.session]);

  const handleUpdateProfile = async () => {
    if (!authState.user) return;
    
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          username
        })
        .eq('id', authState.user.id);
      
      if (error) throw error;
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso."
      });
      
    } catch (err: any) {
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
      
      <div className="max-w-md space-y-6 bg-white p-6 rounded-lg shadow">
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
      </div>
    </div>
  );
};

export default UserProfile;
