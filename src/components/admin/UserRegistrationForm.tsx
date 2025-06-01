
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface UserRegistrationFormProps {
  onUserCreated?: () => void;
}

/**
 * Formulário de cadastro de usuários para administradores
 * @version 1.0.0
 */
const UserRegistrationForm: React.FC<UserRegistrationFormProps> = ({ onUserCreated }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    username: '',
    whatsapp: '',
    telegram_username: '',
    phone: '',
    role: 'user'
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      toast({
        title: "Erro",
        description: "Email é obrigatório.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.password.trim()) {
      toast({
        title: "Erro",
        description: "Senha é obrigatória.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.full_name.trim()) {
      toast({
        title: "Erro",
        description: "Nome completo é obrigatório.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.whatsapp.trim()) {
      toast({
        title: "Erro",
        description: "WhatsApp é obrigatório.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      // Criar o usuário no Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            username: formData.username || formData.email.split('@')[0],
            whatsapp: formData.whatsapp,
            telegram_username: formData.telegram_username,
            phone: formData.phone,
            role: formData.role
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Atualizar o perfil do usuário recém-criado se necessário
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            username: formData.username || formData.email.split('@')[0],
            whatsapp: formData.whatsapp,
            telegram_username: formData.telegram_username,
            phone: formData.phone,
            role: formData.role
          })
          .eq('id', data.user.id);

        if (updateError) {
          console.error('Erro ao atualizar perfil:', updateError);
        }
      }

      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso.",
      });

      // Limpar o formulário
      setFormData({
        email: '',
        password: '',
        full_name: '',
        username: '',
        whatsapp: '',
        telegram_username: '',
        phone: '',
        role: 'user'
      });

      if (onUserCreated) {
        onUserCreated();
      }

    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar o usuário.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Cadastrar Novo Usuário</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Senha *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div>
              <Label htmlFor="full_name">Nome Completo *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="username">Nome de Usuário</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Deixe vazio para usar parte do email"
              />
            </div>

            <div>
              <Label htmlFor="whatsapp">WhatsApp *</Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                placeholder="(11) 99999-9999"
                required
              />
            </div>

            <div>
              <Label htmlFor="telegram_username">Usuário do Telegram</Label>
              <Input
                id="telegram_username"
                value={formData.telegram_username}
                onChange={(e) => handleInputChange('telegram_username', e.target.value)}
                placeholder="@usuario (opcional)"
              />
            </div>

            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(11) 3333-4444"
              />
            </div>

            <div>
              <Label htmlFor="role">Função</Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Usuário'
              )}
            </Button>
          </div>

          <div className="text-sm text-gray-500">
            <span className="text-red-500">* Campos obrigatórios</span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserRegistrationForm;
