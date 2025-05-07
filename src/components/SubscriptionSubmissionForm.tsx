
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface FormData {
  title: string;
  price: string;
  paymentMethod: string;
  status: string;
  access: string;
  whatsappNumber: string;
  telegramUsername: string;
  paymentProofImage?: File | null;
  pixKey: string;
  headerColor: string;
  priceColor: string;
}

const SubscriptionSubmissionForm: React.FC = () => {
  const { authState } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    title: '',
    price: '',
    paymentMethod: '',
    status: '',
    access: '',
    whatsappNumber: '',
    telegramUsername: '',
    paymentProofImage: null,
    pixKey: '',
    headerColor: 'bg-blue-600',
    priceColor: 'text-blue-600'
  });
  
  const [priceValue, setPriceValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      setFormData(prev => ({
        ...prev,
        paymentProofImage: e.target.files![0]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authState.user) {
      toast({
        variant: "destructive",
        title: "Erro de autenticação",
        description: "Você precisa estar logado para enviar anúncios."
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Format todays date as DD/MM/YYYY
      const today = new Date();
      const formattedDate = format(today, 'dd/MM/yyyy');
      
      // Upload payment proof image if provided
      let paymentProofImageUrl = null;
      if (formData.paymentProofImage) {
        // First, check if storage bucket exists and create if not
        const { data: buckets } = await supabase.storage.listBuckets();
        if (!buckets?.some(bucket => bucket.name === 'payment-proofs')) {
          await supabase.storage.createBucket('payment-proofs', {
            public: false
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
      }
      
      // Preparar os dados conforme o schema esperado pelo Supabase
      const { error } = await supabase
        .from('pending_subscriptions')
        .insert({
          user_id: authState.user.id,
          title: formData.title,
          price: formData.price,
          payment_method: formData.paymentMethod,
          status: formData.status,
          access: formData.access,
          whatsapp_number: formData.whatsappNumber,
          telegram_username: formData.telegramUsername,
          header_color: formData.headerColor,
          price_color: formData.priceColor,
          pix_key: formData.pixKey,
          payment_proof_image: paymentProofImageUrl,
          added_date: formattedDate
        });
      
      if (error) throw error;
      
      toast({
        title: "Anúncio enviado",
        description: "Seu anúncio foi enviado para aprovação."
      });
      
      // Redirect to home page
      navigate('/');
      
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar anúncio",
        description: err.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title" className="block text-sm font-medium">Título *</Label>
          <Input 
            id="title" 
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="mt-1"
            placeholder="Ex: NETFLIX PREMIUM"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="price" className="block text-sm font-medium">Valor *</Label>
          <Input 
            id="price" 
            name="price"
            value={priceValue}
            onChange={handlePriceChange}
            className="mt-1"
            placeholder="R$ 0,00"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="paymentMethod" className="block text-sm font-medium">Forma de Pagamento *</Label>
          <Input 
            id="paymentMethod" 
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            className="mt-1"
            placeholder="Ex: PIX"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="status" className="block text-sm font-medium">Status *</Label>
          <Input 
            id="status" 
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1"
            placeholder="Ex: Assinado (3 vagas)"
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="access" className="block text-sm font-medium">Tipo de Acesso *</Label>
        <Select 
          name="access"
          value={formData.access}
          onValueChange={(value) => setFormData(prev => ({ ...prev, access: value }))}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo de acesso" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CONVITE POR E-MAIL">CONVITE POR E-MAIL</SelectItem>
            <SelectItem value="LOGIN E SENHA">LOGIN E SENHA</SelectItem>
            <SelectItem value="ATIVAÇÃO">ATIVAÇÃO</SelectItem>
            <SelectItem value="CONVITE">CONVITE</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="pixKey" className="block text-sm font-medium">Chave PIX *</Label>
        <Input 
          id="pixKey" 
          name="pixKey"
          value={formData.pixKey}
          onChange={handleChange}
          className="mt-1"
          placeholder="Ex: seu@email.com"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="paymentProofImage" className="block text-sm font-medium">Enviar comprovante de assinatura da conta *</Label>
        <Input 
          id="paymentProofImage" 
          name="paymentProofImage"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mt-1"
          required
        />
        <p className="text-xs text-gray-500 mt-1">Envie um screenshot ou imagem que comprove a assinatura ativa.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="whatsappNumber" className="block text-sm font-medium">Número WhatsApp *</Label>
          <Input 
            id="whatsappNumber" 
            name="whatsappNumber"
            value={formData.whatsappNumber}
            onChange={handleChange}
            className="mt-1"
            placeholder="Ex: 5511999999999"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="telegramUsername" className="block text-sm font-medium">Username Telegram *</Label>
          <Input 
            id="telegramUsername" 
            name="telegramUsername"
            value={formData.telegramUsername}
            onChange={handleChange}
            className="mt-1"
            placeholder="Ex: usuariotelegram"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="block text-sm font-medium">Cor do Cabeçalho</Label>
          <Select 
            name="headerColor"
            value={formData.headerColor}
            onValueChange={(value) => setFormData(prev => ({ ...prev, headerColor: value }))}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a cor do cabeçalho" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bg-blue-600">Azul</SelectItem>
              <SelectItem value="bg-red-600">Vermelho</SelectItem>
              <SelectItem value="bg-green-600">Verde</SelectItem>
              <SelectItem value="bg-purple-600">Roxo</SelectItem>
              <SelectItem value="bg-yellow-600">Amarelo</SelectItem>
              <SelectItem value="bg-pink-600">Rosa</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="block text-sm font-medium">Cor do Valor</Label>
          <Select 
            name="priceColor"
            value={formData.priceColor}
            onValueChange={(value) => setFormData(prev => ({ ...prev, priceColor: value }))}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a cor do valor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text-blue-600">Azul</SelectItem>
              <SelectItem value="text-red-600">Vermelho</SelectItem>
              <SelectItem value="text-green-600">Verde</SelectItem>
              <SelectItem value="text-purple-600">Roxo</SelectItem>
              <SelectItem value="text-yellow-600">Amarelo</SelectItem>
              <SelectItem value="text-pink-600">Rosa</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
          ) : 'Enviar Anúncio para Aprovação'}
        </Button>
      </div>
    </form>
  );
};

export default SubscriptionSubmissionForm;
