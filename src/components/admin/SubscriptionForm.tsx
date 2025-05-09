import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Loader2, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Subscription, prepareSubscriptionForDB } from '@/types/subscriptionTypes';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const SubscriptionForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Initialize with both snake_case and camelCase properties
  const [formData, setFormData] = useState<Subscription>({
    title: '',
    price: '',
    payment_method: '',
    paymentMethod: '',
    status: 'Assinado',
    access: 'LOGIN E SENHA',
    header_color: 'bg-blue-600',
    headerColor: 'bg-blue-600', 
    price_color: 'text-blue-600',
    priceColor: 'text-blue-600',
    whatsapp_number: '',
    whatsappNumber: '',
    telegram_username: '',
    telegramUsername: '',
    icon: 'monitor',
    added_date: format(new Date(), 'dd/MM/yyyy'),
    addedDate: format(new Date(), 'dd/MM/yyyy'),
    pix_key: '',
    pixKey: '',
    code: '',
    id: ''
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(!!id);
  const [error, setError] = useState<string | null>(null);
  const [paymentProofImage, setPaymentProofImage] = useState<File | null>(null);
  const [priceValue, setPriceValue] = useState('');
  const [existingPaymentProofImageUrl, setExistingPaymentProofImageUrl] = useState<string | null>(null);

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
            // Set both snake_case and camelCase properties
            setFormData({
              id: data.id,
              title: data.title || '',
              price: data.price || '',
              payment_method: data.payment_method || '',
              paymentMethod: data.payment_method || '',
              status: data.status || 'Assinado',
              access: data.access || 'LOGIN E SENHA',
              header_color: data.header_color || 'bg-blue-600',
              headerColor: data.header_color || 'bg-blue-600',
              price_color: data.price_color || 'text-blue-600',
              priceColor: data.price_color || 'text-blue-600',
              whatsapp_number: data.whatsapp_number || '',
              whatsappNumber: data.whatsapp_number || '',
              telegram_username: data.telegram_username || '',
              telegramUsername: data.telegram_username || '',
              icon: data.icon || 'monitor',
              added_date: data.added_date || format(new Date(), 'dd/MM/yyyy'),
              addedDate: data.added_date || format(new Date(), 'dd/MM/yyyy'),
              pix_key: data.pix_key || '',
              pixKey: data.pix_key || '',
              payment_proof_image: data.payment_proof_image || '',
              paymentProofImage: data.payment_proof_image || '',
              featured: data.featured || false,
              code: data.code || ''
            });
            
            setPriceValue(data.price || '');
            
            // Check if there's a payment proof image
            if (data.payment_proof_image) {
              setExistingPaymentProofImageUrl(data.payment_proof_image);
            }
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
    }
  }, [id, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Keep both snake_case and camelCase versions in sync
      if (name === 'paymentMethod') updated.payment_method = value;
      else if (name === 'payment_method') updated.paymentMethod = value;
      else if (name === 'headerColor') updated.header_color = value;
      else if (name === 'header_color') updated.headerColor = value;
      else if (name === 'priceColor') updated.price_color = value;
      else if (name === 'price_color') updated.priceColor = value;
      else if (name === 'whatsappNumber') updated.whatsapp_number = value;
      else if (name === 'whatsapp_number') updated.whatsappNumber = value;
      else if (name === 'telegramUsername') updated.telegram_username = value;
      else if (name === 'telegram_username') updated.telegramUsername = value;
      else if (name === 'addedDate') updated.added_date = value;
      else if (name === 'added_date') updated.addedDate = value;
      else if (name === 'pixKey') updated.pix_key = value;
      else if (name === 'pix_key') updated.pixKey = value;
      
      return updated;
    });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Remove non-numeric characters except decimal point
    value = value.replace(/[^\d,]/g, '');
    
    // Format as currency
    if (value) {
      // Convert comma to dot for calculation
      const numericValue = value.replace(',', '.');
      // Parse as float and format
      const numberValue = parseFloat(numericValue);
      
      if (!isNaN(numberValue)) {
        // Format with 2 decimal places and replace dot with comma
        value = `R$ ${numberValue.toFixed(2).replace('.', ',')}`;
      } else {
        value = 'R$ ';
      }
    } else {
      value = 'R$ ';
    }
    
    setPriceValue(value);
    setFormData(prev => ({
      ...prev,
      price: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPaymentProofImage(e.target.files[0]);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Keep both snake_case and camelCase versions in sync
      if (name === 'paymentMethod') updated.payment_method = value;
      else if (name === 'payment_method') updated.paymentMethod = value;
      else if (name === 'headerColor') updated.header_color = value;
      else if (name === 'header_color') updated.headerColor = value;
      else if (name === 'priceColor') updated.price_color = value;
      else if (name === 'price_color') updated.priceColor = value;
      else if (name === 'whatsappNumber') updated.whatsapp_number = value;
      else if (name === 'whatsapp_number') updated.whatsappNumber = value;
      else if (name === 'telegramUsername') updated.telegram_username = value;
      else if (name === 'telegram_username') updated.telegramUsername = value;
      else if (name === 'addedDate') updated.added_date = value;
      else if (name === 'added_date') updated.addedDate = value;
      else if (name === 'pixKey') updated.pix_key = value;
      else if (name === 'pix_key') updated.pixKey = value;
      
      return updated;
    });
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Upload payment proof image if provided
      let paymentProofImageUrl = existingPaymentProofImageUrl;
      if (paymentProofImage) {
        try {
          // First, check if storage bucket exists and create if not
          const { data: buckets } = await supabase.storage.listBuckets();
          const bucketName = 'payment-proofs';
          
          if (!buckets?.some(bucket => bucket.name === bucketName)) {
            await supabase.storage.createBucket(bucketName, {
              public: false
            });
          }
          
          // Upload the file
          const fileName = `admin_${Date.now()}_${paymentProofImage.name}`;
          const { data, error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(fileName, paymentProofImage);
            
          if (uploadError) throw uploadError;
          
          // Get the URL
          const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(fileName);
            
          paymentProofImageUrl = publicUrl;
        } catch (err) {
          console.error("Error uploading image:", err);
          // Continue with submission even if image upload fails
          // We'll use the existing image URL if available
        }
      }

      // Generate a unique code if this is a new subscription
      let subscriptionCode = formData.code;
      if (!id && !subscriptionCode) {
        // Generate a unique code in format "SF" + 4 random digits
        subscriptionCode = 'SF' + Math.floor(1000 + Math.random() * 9000).toString();
      }

      // Prepare subscription data for DB (convert camelCase to snake_case)
      const subscriptionDataWithSnakeCase = {
        ...formData,
        payment_proof_image: paymentProofImageUrl,
        code: subscriptionCode
      };
      
      // Convert to proper format for DB
      const subscriptionData = prepareSubscriptionForDB(subscriptionDataWithSnakeCase);

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
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="featured" 
                checked={formData.featured} 
                onCheckedChange={(checked) => handleCheckboxChange('featured', checked as boolean)} 
              />
              <Label htmlFor="featured" className="font-medium flex items-center">
                <Star className={`h-4 w-4 mr-1 ${formData.featured ? "fill-yellow-400" : ""}`} />
                Fixar anúncio na página inicial
              </Label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
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
                <Label htmlFor="price">Valor</Label>
                <Input
                  id="price"
                  name="price"
                  placeholder="Ex: R$ 10,00"
                  value={priceValue}
                  onChange={handlePriceChange}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Método de Pagamento</Label>
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
                <Label>Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => handleSelectChange('status', value)}
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
                <Label>Acesso</Label>
                <Select 
                  value={formData.access} 
                  onValueChange={(value) => handleSelectChange('access', value)}
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
                <Label>Ícone</Label>
                <Select 
                  value={formData.icon} 
                  onValueChange={(value) => handleSelectChange('icon', value)}
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
                <Label>Cor do Cabeçalho</Label>
                <Select 
                  value={formData.headerColor} 
                  onValueChange={(value) => handleSelectChange('headerColor', value)}
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
                <Label>Cor do Valor</Label>
                <Select 
                  value={formData.priceColor} 
                  onValueChange={(value) => handleSelectChange('priceColor', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a cor do valor" />
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
                <Label htmlFor="telegramUsername">Usuário do Telegram</Label>
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
                <Label htmlFor="whatsappNumber">Número do WhatsApp</Label>
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
              <Label htmlFor="pixKey">Chave PIX</Label>
              <Input
                id="pixKey"
                name="pixKey"
                placeholder="Ex: seu@email.com"
                value={formData.pixKey || ''}
                onChange={handleChange}
              />
              <p className="text-xs text-gray-500 mt-1">Informe a chave PIX para facilitar o pagamento.</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paymentProofImage">Comprovante de Assinatura (opcional)</Label>
              <Input
                id="paymentProofImage"
                name="paymentProofImage"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              {existingPaymentProofImageUrl && !paymentProofImage && (
                <div className="mt-2">
                  <p className="text-sm mb-2">Comprovante atual:</p>
                  <img 
                    src={existingPaymentProofImageUrl} 
                    alt="Comprovante de Assinatura" 
                    className="max-h-32 border rounded-md"
                  />
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {existingPaymentProofImageUrl ? "Envie um novo arquivo para substituir o comprovante atual." : "Envie uma imagem que comprove a assinatura ativa (opcional)."}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="addedDate">Data de Adição</Label>
              <Input
                id="addedDate"
                name="addedDate"
                placeholder="Ex: 01/05/2025"
                value={formData.addedDate}
                onChange={handleChange}
                required
              />
            </div>
            
            {/* Add code field */}
            <div className="space-y-2">
              <Label htmlFor="code">Código Único</Label>
              <Input
                id="code"
                name="code"
                placeholder="Ex: SF1234"
                value={formData.code}
                onChange={handleChange}
                disabled={!!id} // Only allow editing for new subscriptions
              />
              {!id && <p className="text-xs text-gray-500 mt-1">Um código único será gerado automaticamente se este campo for deixado vazio.</p>}
              {id && <p className="text-xs text-gray-500 mt-1">O código único não pode ser alterado após a criação.</p>}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/admin/subscriptions')}
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
                id ? 'Atualizar Anúncio' : 'Criar Anúncio'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default SubscriptionForm;
