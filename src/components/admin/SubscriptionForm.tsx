
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Loader2, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionData } from '@/types/subscriptionTypes';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';

const SubscriptionForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { authState } = useAuth();
  const isAdmin = authState.user?.role === 'admin';
  
  const [formData, setFormData] = useState<SubscriptionData>({
    title: '',
    price: 'R$ ',
    paymentMethod: '',
    status: 'Assinado',
    access: 'LOGIN E SENHA',
    headerColor: 'bg-blue-600',
    priceColor: 'text-blue-600',
    whatsappNumber: '',
    telegramUsername: '',
    icon: 'monitor',
    addedDate: format(new Date(), 'dd/MM/yyyy'),
    pixImage: null
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(!!id);
  const [error, setError] = useState<string | null>(null);
  const [pixImage, setPixImage] = useState<File | null>(null);

  useEffect(() => {
    if (id) {
      const fetchSubscription = async () => {
        try {
          setIsFetching(true);
          const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) throw error;
          
          if (data) {
            setFormData({
              title: data.title || '',
              price: data.price || 'R$ ',
              paymentMethod: data.payment_method || '',
              status: data.status || 'Assinado',
              access: data.access || 'LOGIN E SENHA',
              headerColor: data.header_color || 'bg-blue-600',
              priceColor: data.price_color || 'text-blue-600',
              whatsappNumber: data.whatsapp_number || '',
              telegramUsername: data.telegram_username || '',
              icon: data.icon || 'monitor',
              addedDate: data.added_date || format(new Date(), 'dd/MM/yyyy'),
              pixImage: null
            });
          }
        } catch (err: any) {
          setError(err.message);
          toast({
            variant: "destructive",
            title: "Erro ao carregar anúncio",
            description: err.message
          });
        } finally {
          setIsFetching(false);
        }
      };
      
      fetchSubscription();
    } else if (!formData.price.startsWith('R$ ')) {
      setFormData(prev => ({...prev, price: `R$ ${prev.price}`}));
    }
  }, [id, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      // Ensure price always starts with R$ 
      if (!value.startsWith('R$ ')) {
        setFormData({
          ...formData,
          [name]: `R$ ${value.replace('R$ ', '')}`
        });
      } else {
        setFormData({
          ...formData,
          [name]: value
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPixImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const subscriptionData = {
        title: formData.title,
        price: formData.price,
        payment_method: formData.paymentMethod,
        status: formData.status,
        access: formData.access,
        header_color: formData.headerColor,
        price_color: formData.priceColor,
        whatsapp_number: formData.whatsappNumber,
        telegram_username: formData.telegramUsername,
        icon: formData.icon,
        added_date: formData.addedDate
      };

      if (isAdmin) {
        if (id) {
          // Update existing subscription
          const { error } = await supabase
            .from('subscriptions')
            .update(subscriptionData)
            .eq('id', id);
          
          if (error) throw error;
          
          toast({
            title: "Anúncio atualizado",
            description: "O anúncio foi atualizado com sucesso."
          });
        } else {
          // Create new subscription
          const { error } = await supabase
            .from('subscriptions')
            .insert(subscriptionData);
          
          if (error) throw error;
          
          toast({
            title: "Anúncio criado",
            description: "O anúncio foi criado com sucesso."
          });
        }
        
        // Redirect to subscription list
        navigate('/admin/subscriptions');
      } else {
        // If user is not admin, submit as pending subscription
        const pendingData = {
          ...subscriptionData,
          user_id: authState.user?.id
        };

        const { error } = await supabase
          .from('pending_subscriptions')
          .insert(pendingData);
        
        if (error) throw error;
        
        toast({
          title: "Anúncio enviado para aprovação",
          description: "Seu anúncio foi enviado e está aguardando aprovação de um administrador."
        });
        
        // Redirect to home page for non-admin users
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Erro ao salvar anúncio",
        description: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="mt-4 text-muted-foreground">Carregando anúncio...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{id ? 'Editar' : 'Novo'} Anúncio</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-md flex items-center gap-3 mb-6">
          <AlertTriangle className="text-red-500" />
          <span className="text-red-600">{error}</span>
        </div>
      )}
      
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Informações do Anúncio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título*</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Ex: SPOTIFY PREMIUM"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Preço*</Label>
                <Input
                  id="price"
                  name="price"
                  placeholder="Ex: R$ 10,00 - PIX (Mensal)"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Método de Pagamento*</Label>
                <Input
                  id="paymentMethod"
                  name="paymentMethod"
                  placeholder="Ex: PIX (Mensal)"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Status*</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleSelectChange('status', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Assinado">Assinado</SelectItem>
                    <SelectItem value="Assinado (1 vaga)">Assinado (1 vaga)</SelectItem>
                    <SelectItem value="Assinado (2 vagas)">Assinado (2 vagas)</SelectItem>
                    <SelectItem value="Assinado (3 vagas)">Assinado (3 vagas)</SelectItem>
                    <SelectItem value="Assinado (4 vagas)">Assinado (4 vagas)</SelectItem>
                    <SelectItem value="Aguardando Membros (1 vaga)">Aguardando Membros (1 vaga)</SelectItem>
                    <SelectItem value="Aguardando Membros (2 vagas)">Aguardando Membros (2 vagas)</SelectItem>
                    <SelectItem value="Aguardando Membros (3 vagas)">Aguardando Membros (3 vagas)</SelectItem>
                    <SelectItem value="Aguardando Membros (4 vagas)">Aguardando Membros (4 vagas)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Acesso*</Label>
                <Select 
                  value={formData.access} 
                  onValueChange={(value) => handleSelectChange('access', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de acesso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOGIN E SENHA">LOGIN E SENHA</SelectItem>
                    <SelectItem value="CONVITE POR E-MAIL">CONVITE POR E-MAIL</SelectItem>
                    <SelectItem value="ATIVAÇÃO">ATIVAÇÃO</SelectItem>
                    <SelectItem value="ATIVAÇÃO POR CÓDIGO">ATIVAÇÃO POR CÓDIGO</SelectItem>
                    <SelectItem value="Email e Senha">Email e Senha</SelectItem>
                    <SelectItem value="CONVITE">CONVITE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ícone*</Label>
                <Select 
                  value={formData.icon} 
                  onValueChange={(value) => handleSelectChange('icon', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o ícone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monitor">Monitor (Padrão)</SelectItem>
                    <SelectItem value="tv">TV</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="apple">Apple</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Cor do Cabeçalho*</Label>
                <Select 
                  value={formData.headerColor} 
                  onValueChange={(value) => handleSelectChange('headerColor', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a cor do cabeçalho" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bg-blue-600">Azul</SelectItem>
                    <SelectItem value="bg-green-600">Verde</SelectItem>
                    <SelectItem value="bg-purple-600">Roxo</SelectItem>
                    <SelectItem value="bg-red-600">Vermelho</SelectItem>
                    <SelectItem value="bg-orange-600">Laranja</SelectItem>
                    <SelectItem value="bg-indigo-600">Índigo</SelectItem>
                    <SelectItem value="bg-pink-600">Rosa</SelectItem>
                    <SelectItem value="bg-teal-600">Teal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cor do Preço*</Label>
                <Select 
                  value={formData.priceColor} 
                  onValueChange={(value) => handleSelectChange('priceColor', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a cor do preço" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text-blue-600">Azul</SelectItem>
                    <SelectItem value="text-green-600">Verde</SelectItem>
                    <SelectItem value="text-purple-600">Roxo</SelectItem>
                    <SelectItem value="text-red-600">Vermelho</SelectItem>
                    <SelectItem value="text-orange-600">Laranja</SelectItem>
                    <SelectItem value="text-indigo-600">Índigo</SelectItem>
                    <SelectItem value="text-pink-600">Rosa</SelectItem>
                    <SelectItem value="text-teal-600">Teal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="telegramUsername">Usuário do Telegram*</Label>
                <Input
                  id="telegramUsername"
                  name="telegramUsername"
                  placeholder="Ex: @usuariotelegram"
                  value={formData.telegramUsername}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsappNumber">Número do WhatsApp*</Label>
                <Input
                  id="whatsappNumber"
                  name="whatsappNumber"
                  placeholder="Ex: 5511999999999"
                  value={formData.whatsappNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="addedDate">Data de Adição*</Label>
              <Input
                id="addedDate"
                name="addedDate"
                placeholder="Ex: 01/05/2025"
                value={formData.addedDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pixImage">Imagem do PIX</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="pixImage"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex items-center gap-2"
                  disabled={!pixImage}
                >
                  <Upload className="h-4 w-4" />
                  Enviar
                </Button>
              </div>
              {pixImage && <p className="text-sm text-muted-foreground mt-2">Arquivo selecionado: {pixImage.name}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(isAdmin ? '/admin/subscriptions' : '/')}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                isAdmin ? (id ? 'Atualizar Anúncio' : 'Criar Anúncio') : 'Enviar para Aprovação'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default SubscriptionForm;
