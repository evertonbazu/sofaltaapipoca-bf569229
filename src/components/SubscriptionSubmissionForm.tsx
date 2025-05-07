
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import { AlertCircle, Upload, Loader2 } from 'lucide-react';

interface FormData {
  title: string;
  price: string;
  paymentMethod: string;
  status: string;
  access: string;
  headerColor: string;
  priceColor: string;
  whatsappNumber: string;
  telegramUsername: string;
  icon: string;
  pixQrCode?: string;
  paymentProofImage?: File;
  código?: number;
}

const initialFormData: FormData = {
  title: '',
  price: '',
  paymentMethod: 'PIX',
  status: '',
  access: '',
  headerColor: 'bg-blue-600',
  priceColor: 'text-blue-600',
  whatsappNumber: '',
  telegramUsername: '',
  icon: 'monitor',
};

const SubscriptionSubmissionForm: React.FC = () => {
  const { authState } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user is typing
    if (errorMessage) setErrorMessage(null);
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user makes a selection
    if (errorMessage) setErrorMessage(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        paymentProofImage: file
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title || !formData.price || !formData.status || 
        !formData.access || !formData.whatsappNumber || !formData.telegramUsername) {
      setErrorMessage('Preencha todos os campos obrigatórios.');
      toast({
        variant: "destructive",
        title: "Erro no formulário",
        description: "Preencha todos os campos obrigatórios.",
      });
      return;
    }

    if (!authState.user) {
      setErrorMessage('É necessário estar logado para enviar um anúncio.');
      toast({
        variant: "destructive",
        title: "Usuário não autenticado",
        description: "Você precisa estar logado para enviar um anúncio.",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Format today's date as DD/MM/YYYY
      const today = new Date();
      const formattedDate = format(today, 'dd/MM/yyyy');
      
      // Upload payment proof image if provided
      let paymentProofImageUrl = null;
      if (formData.paymentProofImage) {
        try {
          // First, check if storage bucket exists and create if not
          const { data: buckets } = await supabase.storage.listBuckets();
          if (!buckets?.some(bucket => bucket.name === 'payment-proofs')) {
            await supabase.storage.createBucket('payment-proofs', {
              public: true // Make sure the bucket is public so we can access the images
            });
          }
          
          // Upload the file
          const fileName = `${authState.user.id}_${Date.now()}_${formData.paymentProofImage.name}`;
          const { data, error: uploadError } = await supabase.storage
            .from('payment-proofs')
            .upload(fileName, formData.paymentProofImage);
            
          if (uploadError) throw uploadError;
          
          // Get the URL
          const { data: { publicUrl } } = supabase.storage
            .from('payment-proofs')
            .getPublicUrl(fileName);
            
          paymentProofImageUrl = publicUrl;
        } catch (uploadErr: any) {
          console.error("Error uploading image:", uploadErr);
          // Continue with submission even if image upload fails
          toast({
            variant: "destructive",
            title: "Aviso",
            description: "Não foi possível anexar a imagem, mas seu anúncio será enviado."
          });
        }
      }
      
      // Preparar os dados conforme o schema esperado pelo Supabase
      const subscriptionData = {
        title: formData.title,
        price: formData.price,
        payment_method: formData.paymentMethod,
        status: formData.status,
        access: formData.access,
        header_color: formData.headerColor,
        price_color: formData.priceColor,
        whatsapp_number: formData.whatsappNumber,
        telegram_username: formData.telegramUsername.startsWith('@') 
          ? formData.telegramUsername 
          : `@${formData.telegramUsername}`,
        icon: formData.icon,
        added_date: formattedDate,
        pix_qr_code: formData.pixQrCode || null,
        payment_proof_image: paymentProofImageUrl,
        user_id: authState.user.id,
        código: formData.código || null
      };
      
      // Insert the subscription into pending_subscriptions table
      const { data, error } = await supabase
        .from('pending_subscriptions')
        .insert(subscriptionData);
      
      if (error) {
        console.error("Error submitting subscription:", error);
        throw new Error(error.message);
      }
      
      // Show success message
      toast({
        title: "Anúncio enviado com sucesso!",
        description: "Seu anúncio será revisado pela nossa equipe antes de ser publicado.",
      });
      
      // Reset form
      setFormData(initialFormData);
      
      // Redirect back to home
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error: any) {
      console.error("Error in form submission:", error);
      setErrorMessage(error.message);
      toast({
        variant: "destructive",
        title: "Erro ao enviar anúncio",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const headerColorOptions = [
    { value: 'bg-blue-600', label: 'Azul' },
    { value: 'bg-green-600', label: 'Verde' },
    { value: 'bg-red-600', label: 'Vermelho' },
    { value: 'bg-purple-600', label: 'Roxo' },
    { value: 'bg-yellow-600', label: 'Amarelo' },
    { value: 'bg-pink-600', label: 'Rosa' },
    { value: 'bg-teal-600', label: 'Teal' },
    { value: 'bg-orange-600', label: 'Laranja' },
  ];
  
  const priceColorOptions = [
    { value: 'text-blue-600', label: 'Azul' },
    { value: 'text-green-600', label: 'Verde' },
    { value: 'text-red-600', label: 'Vermelho' },
    { value: 'text-purple-600', label: 'Roxo' },
    { value: 'text-yellow-600', label: 'Amarelo' },
    { value: 'text-pink-600', label: 'Rosa' },
    { value: 'text-teal-600', label: 'Teal' },
    { value: 'text-orange-600', label: 'Laranja' },
  ];
  
  const iconOptions = [
    { value: 'monitor', label: 'Monitor' },
    { value: 'music', label: 'Música' },
    { value: 'video', label: 'Vídeo' },
    { value: 'tv', label: 'TV' },
    { value: 'book', label: 'Livro' },
    { value: 'gamepad2', label: 'Jogos' },
    { value: 'smartphone', label: 'Smartphone' },
    { value: 'graduation-cap', label: 'Educação' },
    { value: 'shield', label: 'Segurança' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <p>{errorMessage}</p>
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Título do Anúncio *</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Ex: Netflix Premium"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Preço *</Label>
            <Input
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Ex: R$ 10,00"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="paymentMethod">Forma de Pagamento *</Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value) => handleSelectChange(value, 'paymentMethod')}
            >
              <SelectTrigger id="paymentMethod">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PIX">PIX</SelectItem>
                <SelectItem value="Boleto">Boleto</SelectItem>
                <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                <SelectItem value="PayPal">PayPal</SelectItem>
                <SelectItem value="Transferência Bancária">Transferência Bancária</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <Label htmlFor="status">Status *</Label>
          <Input
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            placeholder="Ex: Assinado (2 vagas)"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="access">Tipo de Acesso *</Label>
          <Input
            id="access"
            name="access"
            value={formData.access}
            onChange={handleChange}
            placeholder="Ex: ATIVAÇÃO / LOGIN / PERFIL"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="whatsappNumber">WhatsApp *</Label>
            <Input
              id="whatsappNumber"
              name="whatsappNumber"
              value={formData.whatsappNumber}
              onChange={handleChange}
              placeholder="Ex: 5511999999999"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="telegramUsername">Usuário Telegram *</Label>
            <Input
              id="telegramUsername"
              name="telegramUsername"
              value={formData.telegramUsername}
              onChange={handleChange}
              placeholder="Ex: @usuariotelegram"
              required
            />
            <p className="text-sm text-gray-500 mt-1">Se não tiver @, adicionaremos automaticamente</p>
          </div>
        </div>
        
        <div>
          <Label htmlFor="código">Código</Label>
          <Input
            id="código"
            name="código"
            type="number"
            value={formData.código || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              código: e.target.value ? parseInt(e.target.value) : undefined
            }))}
            placeholder="Código do anúncio (opcional)"
          />
        </div>
        
        <div>
          <Label htmlFor="pixQrCode">QR Code PIX (opcional)</Label>
          <Textarea
            id="pixQrCode"
            name="pixQrCode"
            value={formData.pixQrCode || ''}
            onChange={handleChange}
            placeholder="Cole aqui o código do QR code PIX"
            className="h-24"
          />
        </div>
        
        <div>
          <Label>Comprovante de pagamento (opcional)</Label>
          <div className="mt-1 border-2 border-dashed border-gray-300 rounded-md p-6">
            <div className="flex justify-center">
              <div className="space-y-2 text-center">
                <div className="flex justify-center">
                  <Upload className="h-7 w-7 text-gray-400" />
                </div>
                <div className="text-sm text-gray-500">
                  <label htmlFor="paymentProofImage" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none">
                    <span>Selecione um arquivo</span>
                    <input
                      id="paymentProofImage"
                      name="paymentProofImage"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                  <p> ou arraste e solte</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF até 10MB</p>
              </div>
            </div>
            {formData.paymentProofImage && (
              <div className="mt-4 flex items-center justify-center text-sm text-gray-600">
                <p>{formData.paymentProofImage.name}</p>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <Label>Cor do cabeçalho</Label>
          <RadioGroup
            value={formData.headerColor}
            onValueChange={(value) => handleSelectChange(value, 'headerColor')}
            className="grid grid-cols-4 gap-2 mt-2"
          >
            {headerColorOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem id={`header-${option.value}`} value={option.value} className="sr-only" />
                <Label
                  htmlFor={`header-${option.value}`}
                  className={`${option.value} flex-1 h-8 rounded-md cursor-pointer flex items-center justify-center text-white text-xs px-2 ${
                    formData.headerColor === option.value ? 'ring-2 ring-offset-2 ring-primary' : ''
                  }`}
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        
        <div>
          <Label>Cor do preço</Label>
          <RadioGroup
            value={formData.priceColor}
            onValueChange={(value) => handleSelectChange(value, 'priceColor')}
            className="grid grid-cols-4 gap-2 mt-2"
          >
            {priceColorOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem id={`price-${option.value}`} value={option.value} className="sr-only" />
                <Label
                  htmlFor={`price-${option.value}`}
                  className={`${option.value} flex-1 h-8 rounded-md cursor-pointer flex items-center justify-center text-xs px-2 border ${
                    formData.priceColor === option.value ? 'ring-2 ring-offset-2 ring-primary' : ''
                  }`}
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        
        <div>
          <Label>Ícone</Label>
          <RadioGroup
            value={formData.icon}
            onValueChange={(value) => handleSelectChange(value, 'icon')}
            className="grid grid-cols-3 gap-2 mt-2"
          >
            {iconOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem id={`icon-${option.value}`} value={option.value} className="sr-only" />
                <Label
                  htmlFor={`icon-${option.value}`}
                  className={`flex-1 h-8 rounded-md cursor-pointer flex items-center justify-center text-xs px-2 border ${
                    formData.icon === option.value ? 'ring-2 ring-offset-2 ring-primary bg-gray-100' : ''
                  }`}
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        
        <div className="pt-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : 'Enviar Anúncio'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default SubscriptionSubmissionForm;
