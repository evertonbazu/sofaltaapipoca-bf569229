
import React, { useState, useEffect } from 'react';
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
import { AlertCircle, Upload, Loader2, Lock, Tag, List, Check } from 'lucide-react';
import { generateSubscriptionCode } from '@/utils/codeGenerator';

interface FormData {
  title: string;
  customTitle: string;
  paymentMethod: string;
  customPaymentMethod: string;
  status: string;
  access: string;
  whatsappNumber: string;
  telegramUsername: string;
  pixKey: string;
  paymentProofImage?: File;
  headerColor: string;
  priceColor: string;
  icon: string;
  price: string;
  code: string;
}

const initialFormData: FormData = {
  title: '',
  customTitle: '',
  price: '',
  paymentMethod: 'PIX (Mensal)',
  customPaymentMethod: '',
  status: 'Assinado',
  access: 'LOGIN E SENHA',
  whatsappNumber: '',
  telegramUsername: '',
  pixKey: '',
  headerColor: 'bg-blue-600', // Will be set automatically but need initial value
  priceColor: 'text-blue-600', // Will be set automatically but need initial value
  icon: 'monitor', // Will be set automatically but need initial value
  code: '',
};

const headerColorOptions = [
  'bg-blue-600', 'bg-green-600', 'bg-red-600', 'bg-purple-600', 
  'bg-yellow-600', 'bg-pink-600', 'bg-teal-600', 'bg-orange-600'
];

const priceColorOptions = [
  'text-blue-600', 'text-green-600', 'text-red-600', 'text-purple-600',
  'text-yellow-600', 'text-pink-600', 'text-teal-600', 'text-orange-600'
];

const iconOptions = [
  'monitor', 'music', 'video', 'tv', 'book', 
  'gamepad2', 'smartphone', 'graduation-cap', 'shield'
];

const SubscriptionSubmissionForm: React.FC = () => {
  const { authState } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [existingTitles, setExistingTitles] = useState<string[]>([]);
  const [imageSelected, setImageSelected] = useState(false);

  useEffect(() => {
    // Generate a unique code for the new subscription
    const generateUniqueCode = async () => {
      try {
        // Fetch subscription count for category code
        const { count, error } = await supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true });
        
        if (error) throw error;
        
        // Generate code with category 0 (general) and count + 1 as index
        const code = generateSubscriptionCode('SF', 0, (count || 0) + 1);
        setFormData(prev => ({ ...prev, code }));
      } catch (err) {
        console.error("Error generating unique code:", err);
        // Fallback to a random code if error occurs
        const randomCode = 'SF0' + Math.floor(1000 + Math.random() * 9000).toString();
        setFormData(prev => ({ ...prev, code: randomCode }));
      }
    };

    // Fetch existing subscription titles
    const fetchExistingTitles = async () => {
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('title')
          .order('title');
        
        if (error) throw error;
        
        if (data) {
          const titles = [...new Set(data.map(item => item.title))];
          setExistingTitles(titles);
        }
      } catch (err) {
        console.error("Error fetching subscription titles:", err);
      }
    };

    // Randomly assign header color, price color, and icon
    const assignRandomStyles = () => {
      const randomHeaderColor = headerColorOptions[Math.floor(Math.random() * headerColorOptions.length)];
      const randomPriceColor = priceColorOptions[Math.floor(Math.random() * priceColorOptions.length)];
      const randomIcon = iconOptions[Math.floor(Math.random() * iconOptions.length)];
      
      setFormData(prev => ({
        ...prev,
        headerColor: randomHeaderColor,
        priceColor: randomPriceColor,
        icon: randomIcon
      }));
    };

    generateUniqueCode();
    fetchExistingTitles();
    assignRandomStyles();
  }, []);

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
    if (name === 'title' && value === 'custom') {
      // If "Other" is selected for title, don't update the title field yet
      // The user will input in the customTitle field
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
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
      setImageSelected(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Determine the final title based on selection
    const finalTitle = formData.title === 'custom' ? formData.customTitle : formData.title;
    
    // Determine the final payment method based on selection
    const finalPaymentMethod = formData.paymentMethod === 'Outra' ? formData.customPaymentMethod : formData.paymentMethod;
    
    // Validate form
    if (!finalTitle || !formData.price || !formData.status || 
        !formData.access || !formData.whatsappNumber || !formData.telegramUsername || 
        !formData.pixKey || !imageSelected) {
      
      let errorMsg = 'Preencha todos os campos obrigatórios.';
      
      if (!finalTitle) errorMsg = 'Por favor, selecione ou digite um título para o anúncio.';
      else if (!formData.price) errorMsg = 'Por favor, informe o valor do anúncio.';
      else if (!formData.pixKey) errorMsg = 'Por favor, informe sua chave PIX.';
      else if (!imageSelected) errorMsg = 'Por favor, anexe um comprovante de pagamento.';
      
      setErrorMessage(errorMsg);
      toast({
        variant: "destructive",
        title: "Erro no formulário",
        description: errorMsg,
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
      
      // Upload payment proof image
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
          throw new Error("Não foi possível anexar a imagem. Por favor, tente novamente.");
        }
      }
      
      // Prepare data for Supabase
      const subscriptionData = {
        title: finalTitle,
        price: formData.price,
        payment_method: finalPaymentMethod,
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
        pix_key: formData.pixKey,
        payment_proof_image: paymentProofImageUrl,
        user_id: authState.user.id,
        code: formData.code
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
      setImageSelected(false);
      
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <p>{errorMessage}</p>
        </div>
      )}
      
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Tag className="h-5 w-5 text-blue-600" />
          <h3 className="font-medium">Código do Anúncio: <span className="font-bold">{formData.code}</span></h3>
        </div>

        <div>
          <Label htmlFor="title">Título do Anúncio *</Label>
          <Select
            value={formData.title}
            onValueChange={(value) => handleSelectChange(value, 'title')}
          >
            <SelectTrigger id="title" className="w-full">
              <SelectValue placeholder="Selecione um título ou digite um personalizado" />
            </SelectTrigger>
            <SelectContent>
              {existingTitles.map((title) => (
                <SelectItem key={title} value={title}>{title}</SelectItem>
              ))}
              <SelectItem value="custom">Outro Anúncio...</SelectItem>
            </SelectContent>
          </Select>
          
          {formData.title === 'custom' && (
            <div className="mt-2">
              <Input
                id="customTitle"
                name="customTitle"
                value={formData.customTitle}
                onChange={handleChange}
                placeholder="Digite o título do anúncio"
                required={formData.title === 'custom'}
              />
            </div>
          )}
        </div>
        
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
            <SelectTrigger id="paymentMethod" className="w-full">
              <SelectValue placeholder="Selecione a forma de pagamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PIX (Mensal)">PIX (Mensal)</SelectItem>
              <SelectItem value="PIX (ANUAL)">PIX (ANUAL)</SelectItem>
              <SelectItem value="Outra">Outra Forma...</SelectItem>
            </SelectContent>
          </Select>
          
          {formData.paymentMethod === 'Outra' && (
            <div className="mt-2">
              <Input
                id="customPaymentMethod"
                name="customPaymentMethod"
                value={formData.customPaymentMethod}
                onChange={handleChange}
                placeholder="Digite a forma de pagamento"
                required={formData.paymentMethod === 'Outra'}
              />
            </div>
          )}
        </div>
        
        <div>
          <Label htmlFor="status">Status *</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleSelectChange(value, 'status')}
          >
            <SelectTrigger id="status" className="w-full">
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Assinado">Assinado</SelectItem>
              <SelectItem value="Assinado (1 vaga)">Assinado (1 vaga)</SelectItem>
              <SelectItem value="Assinado (2 vagas)">Assinado (2 vagas)</SelectItem>
              <SelectItem value="Assinado (3 vagas)">Assinado (3 vagas)</SelectItem>
              <SelectItem value="Assinado (4 vagas)">Assinado (4 vagas)</SelectItem>
              <SelectItem value="Aguardando Membros">Aguardando Membros</SelectItem>
              <SelectItem value="Aguardando Membros (1 vaga)">Aguardando Membros (1 vaga)</SelectItem>
              <SelectItem value="Aguardando Membros (2 vagas)">Aguardando Membros (2 vagas)</SelectItem>
              <SelectItem value="Aguardando Membros (3 vagas)">Aguardando Membros (3 vagas)</SelectItem>
              <SelectItem value="Aguardando Membros (4 vagas)">Aguardando Membros (4 vagas)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="access">Tipo de Acesso *</Label>
          <Select
            value={formData.access}
            onValueChange={(value) => handleSelectChange(value, 'access')}
          >
            <SelectTrigger id="access" className="w-full">
              <SelectValue placeholder="Selecione o tipo de acesso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOGIN E SENHA">LOGIN E SENHA</SelectItem>
              <SelectItem value="ATIVAÇÃO">ATIVAÇÃO</SelectItem>
              <SelectItem value="CONVITE">CONVITE</SelectItem>
              <SelectItem value="OUTRO">OUTRO</SelectItem>
            </SelectContent>
          </Select>
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
          <Label htmlFor="pixKey">Qual sua chave PIX? *</Label>
          <Input
            id="pixKey"
            name="pixKey"
            value={formData.pixKey}
            onChange={handleChange}
            placeholder="Ex: seu@email.com, CPF, telefone, chave aleatória"
            required
          />
        </div>
        
        <div>
          <Label>Comprovante de pagamento *</Label>
          <div className={`mt-1 border-2 border-dashed ${imageSelected ? 'border-green-300 bg-green-50' : 'border-gray-300'} rounded-md p-6`}>
            <div className="flex justify-center">
              <div className="space-y-2 text-center">
                <div className="flex justify-center">
                  {imageSelected ? (
                    <Check className="h-7 w-7 text-green-500" />
                  ) : (
                    <Upload className="h-7 w-7 text-gray-400" />
                  )}
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
                      required
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
