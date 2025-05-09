import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Upload, Loader2 } from 'lucide-react';

interface FormData {
  title: string;
  customTitle?: string;
  price: string;
  paymentMethod: string;
  customPaymentMethod?: string;
  status: string;
  access: string;
  whatsappNumber: string;
  telegramUsername: string;
  pixKey: string;
  paymentProofImage?: File;
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
};

const SubscriptionSubmissionForm: React.FC = () => {
  const { authState } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [existingTitles, setExistingTitles] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Fetch existing subscription titles for the dropdown
    const fetchExistingTitles = async () => {
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('title')
          .order('title');
        
        if (error) throw error;
        
        if (data) {
          // Extract unique titles
          const uniqueTitles = Array.from(new Set(data.map(item => item.title)));
          setExistingTitles(uniqueTitles);
        }
      } catch (err) {
        console.error("Error fetching subscription titles:", err);
      }
    };
    
    fetchExistingTitles();
  }, []);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Check required fields
    if (!formData.title) {
      errors.title = "Título do anúncio é obrigatório";
    }
    
    if (formData.title === "outro" && !formData.customTitle) {
      errors.customTitle = "Título personalizado é obrigatório";
    }
    
    if (!formData.price) {
      errors.price = "Preço é obrigatório";
    }
    
    if (!formData.paymentMethod) {
      errors.paymentMethod = "Forma de pagamento é obrigatória";
    }
    
    if (formData.paymentMethod === "outro" && !formData.customPaymentMethod) {
      errors.customPaymentMethod = "Forma de pagamento personalizada é obrigatória";
    }
    
    if (!formData.status) {
      errors.status = "Status é obrigatório";
    }
    
    if (!formData.access) {
      errors.access = "Tipo de acesso é obrigatório";
    }
    
    if (!formData.whatsappNumber) {
      errors.whatsappNumber = "Número do WhatsApp é obrigatório";
    }
    
    if (!formData.telegramUsername) {
      errors.telegramUsername = "Usuário do Telegram é obrigatório";
    }
    
    if (!formData.pixKey) {
      errors.pixKey = "Chave PIX é obrigatória";
    }
    
    // Remove validation for payment proof image
    // Payment proof image is now optional
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Clear error when user is typing
    if (errorMessage) setErrorMessage(null);
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
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
      
      // Clear validation error for this field
      if (validationErrors.paymentProofImage) {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.paymentProofImage;
          return newErrors;
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      setErrorMessage('Por favor, corrija os erros no formulário.');
      toast({
        variant: "destructive",
        title: "Erro no formulário",
        description: "Por favor, preencha todos os campos obrigatórios.",
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
      
      // Determine the actual title to use
      const finalTitle = formData.title === 'outro' ? formData.customTitle : formData.title;
      
      // Determine the actual payment method to use
      const finalPaymentMethod = formData.paymentMethod === 'outro' 
        ? formData.customPaymentMethod 
        : formData.paymentMethod;
      
      // Generate header and price colors based on existing subscriptions with the same title
      let headerColor = 'bg-blue-600';
      let priceColor = 'text-blue-600';
      let icon = 'monitor';
      
      try {
        // Try to find existing subscription with the same title to match styling
        const { data: existingStyle } = await supabase
          .from('subscriptions')
          .select('header_color, price_color, icon')
          .eq('title', finalTitle)
          .limit(1);
          
        if (existingStyle && existingStyle.length > 0) {
          headerColor = existingStyle[0].header_color || headerColor;
          priceColor = existingStyle[0].price_color || priceColor;
          icon = existingStyle[0].icon || icon;
        }
      } catch (err) {
        // Ignore styling errors, use defaults
        console.log("Could not fetch existing styling, using defaults");
      }
      
      // Upload payment proof image if provided
      let paymentProofImageUrl = null;
      if (formData.paymentProofImage) {
        try {
          // Check if storage bucket exists
          const { data: buckets } = await supabase.storage.listBuckets();
          const bucketName = 'payment-proofs';
          
          // Create bucket if it doesn't exist
          if (!buckets?.some(bucket => bucket.name === bucketName)) {
            await supabase.storage.createBucket(bucketName, {
              public: true // Make sure the bucket is public
            });
          }
          
          // Upload the file
          const fileName = `${authState.user.id}_${Date.now()}_${formData.paymentProofImage.name}`;
          const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(fileName, formData.paymentProofImage);
            
          if (uploadError) throw uploadError;
          
          // Get the URL
          const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(fileName);
            
          paymentProofImageUrl = publicUrl;
        } catch (uploadErr: any) {
          console.error("Error uploading image:", uploadErr);
          // Don't throw error - continue with submission even if image upload fails
          // Just log the error and proceed without the image
          console.log("Continuing submission without image due to upload error");
        }
      }
      
      // Generate a unique code
      const { data: codeData, error: codeError } = await supabase.rpc('generate_subscription_code');
      
      if (codeError) throw new Error("Erro ao gerar código único para o anúncio.");
      
      const code = codeData || `SF${Math.floor(1000 + Math.random() * 9000)}`;
      
      // Preparar os dados conforme o schema esperado pelo Supabase
      const subscriptionData = {
        title: finalTitle,
        price: formData.price,
        payment_method: finalPaymentMethod,
        status: formData.status,
        access: formData.access,
        header_color: headerColor,
        price_color: priceColor,
        whatsapp_number: formData.whatsappNumber,
        telegram_username: formData.telegramUsername.startsWith('@') 
          ? formData.telegramUsername 
          : `@${formData.telegramUsername}`,
        icon: icon,
        added_date: formattedDate,
        pix_key: formData.pixKey,
        payment_proof_image: paymentProofImageUrl,
        user_id: authState.user.id,
        code: code
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
          <Select
            value={formData.title}
            onValueChange={(value) => handleSelectChange(value, 'title')}
          >
            <SelectTrigger id="title" className={validationErrors.title ? "border-red-500" : ""}>
              <SelectValue placeholder="Selecione ou digite um novo título" />
            </SelectTrigger>
            <SelectContent>
              {existingTitles.map((title, index) => (
                <SelectItem key={index} value={title}>{title}</SelectItem>
              ))}
              <SelectItem value="outro">Outro (personalizado)</SelectItem>
            </SelectContent>
          </Select>
          {validationErrors.title && (
            <p className="text-sm text-red-500 flex items-center mt-1">
              <AlertCircle className="h-3 w-3 mr-1" /> {validationErrors.title}
            </p>
          )}
          
          {formData.title === 'outro' && (
            <div className="mt-2">
              <Label htmlFor="customTitle">Título Personalizado *</Label>
              <Input
                id="customTitle"
                name="customTitle"
                value={formData.customTitle}
                onChange={handleChange}
                placeholder="Digite o título personalizado"
                className={validationErrors.customTitle ? "border-red-500" : ""}
              />
              {validationErrors.customTitle && (
                <p className="text-sm text-red-500 flex items-center mt-1">
                  <AlertCircle className="h-3 w-3 mr-1" /> {validationErrors.customTitle}
                </p>
              )}
            </div>
          )}
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
              className={validationErrors.price ? "border-red-500" : ""}
            />
            {validationErrors.price && (
              <p className="text-sm text-red-500 flex items-center mt-1">
                <AlertCircle className="h-3 w-3 mr-1" /> {validationErrors.price}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="paymentMethod">Forma de Pagamento *</Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value) => handleSelectChange(value, 'paymentMethod')}
            >
              <SelectTrigger id="paymentMethod" className={validationErrors.paymentMethod ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecione a forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PIX (Mensal)">PIX (Mensal)</SelectItem>
                <SelectItem value="PIX (Anual)">PIX (Anual)</SelectItem>
                <SelectItem value="outro">Outra forma</SelectItem>
              </SelectContent>
            </Select>
            {validationErrors.paymentMethod && (
              <p className="text-sm text-red-500 flex items-center mt-1">
                <AlertCircle className="h-3 w-3 mr-1" /> {validationErrors.paymentMethod}
              </p>
            )}
            
            {formData.paymentMethod === 'outro' && (
              <div className="mt-2">
                <Label htmlFor="customPaymentMethod">Forma de Pagamento Personalizada *</Label>
                <Input
                  id="customPaymentMethod"
                  name="customPaymentMethod"
                  value={formData.customPaymentMethod}
                  onChange={handleChange}
                  placeholder="Digite a forma de pagamento personalizada"
                  className={validationErrors.customPaymentMethod ? "border-red-500" : ""}
                />
                {validationErrors.customPaymentMethod && (
                  <p className="text-sm text-red-500 flex items-center mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" /> {validationErrors.customPaymentMethod}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleSelectChange(value, 'status')}
            >
              <SelectTrigger id="status" className={validationErrors.status ? "border-red-500" : ""}>
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
            {validationErrors.status && (
              <p className="text-sm text-red-500 flex items-center mt-1">
                <AlertCircle className="h-3 w-3 mr-1" /> {validationErrors.status}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="access">Tipo de Acesso *</Label>
            <Select
              value={formData.access}
              onValueChange={(value) => handleSelectChange(value, 'access')}
            >
              <SelectTrigger id="access" className={validationErrors.access ? "border-red-500" : ""}>
                <SelectValue placeholder="Selecione o tipo de acesso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ATIVAÇÃO">ATIVAÇÃO</SelectItem>
                <SelectItem value="LOGIN E SENHA">LOGIN E SENHA</SelectItem>
                <SelectItem value="CONVITE">CONVITE</SelectItem>
                <SelectItem value="OUTRO">OUTRO</SelectItem>
              </SelectContent>
            </Select>
            {validationErrors.access && (
              <p className="text-sm text-red-500 flex items-center mt-1">
                <AlertCircle className="h-3 w-3 mr-1" /> {validationErrors.access}
              </p>
            )}
          </div>
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
              className={validationErrors.whatsappNumber ? "border-red-500" : ""}
            />
            {validationErrors.whatsappNumber && (
              <p className="text-sm text-red-500 flex items-center mt-1">
                <AlertCircle className="h-3 w-3 mr-1" /> {validationErrors.whatsappNumber}
              </p>
            )}
          </div>
          
          <div>
            <Label htmlFor="telegramUsername">Usuário Telegram *</Label>
            <Input
              id="telegramUsername"
              name="telegramUsername"
              value={formData.telegramUsername}
              onChange={handleChange}
              placeholder="Ex: @usuariotelegram"
              className={validationErrors.telegramUsername ? "border-red-500" : ""}
            />
            {validationErrors.telegramUsername && (
              <p className="text-sm text-red-500 flex items-center mt-1">
                <AlertCircle className="h-3 w-3 mr-1" /> {validationErrors.telegramUsername}
              </p>
            )}
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
            placeholder="Ex: seu@email.com ou 11999999999"
            className={validationErrors.pixKey ? "border-red-500" : ""}
          />
          {validationErrors.pixKey && (
            <p className="text-sm text-red-500 flex items-center mt-1">
              <AlertCircle className="h-3 w-3 mr-1" /> {validationErrors.pixKey}
            </p>
          )}
        </div>
        
        <div>
          <Label>Comprovante de pagamento (opcional)</Label>
          <div className={`mt-1 border-2 border-dashed ${validationErrors.paymentProofImage ? "border-red-500" : "border-gray-300"} rounded-md p-6`}>
            <div className="flex justify-center">
              <div className="space-y-2 text-center">
                <div className="flex justify-center">
                  <Upload className={`h-7 w-7 ${validationErrors.paymentProofImage ? "text-red-500" : "text-gray-400"}`} />
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
          {validationErrors.paymentProofImage && (
            <p className="text-sm text-red-500 flex items-center mt-1">
              <AlertCircle className="h-3 w-3 mr-1" /> {validationErrors.paymentProofImage}
            </p>
          )}
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
