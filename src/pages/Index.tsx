import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from '@/components/SearchBar';
import SubscriptionList from '@/components/SubscriptionList';
import NoResults from '@/components/NoResults';
import { MessageSquare, Megaphone, User, Settings, Home, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Index: React.FC = () => {
  const { authState, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [hasResults, setHasResults] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const subscriptionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const handleSearch = (term: string) => {
    setSearchTerm(term.toLowerCase());
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const importSubscriptions = async () => {
    if (!authState.user || !isAdmin()) return;
    
    try {
      setIsImporting(true);
      
      // Get existing subscriptions to avoid importing duplicates
      const { data: existingSubs } = await supabase
        .from('subscriptions')
        .select('title, telegram_username');
        
      const existingMap = new Map();
      if (existingSubs) {
        existingSubs.forEach((sub: any) => {
          const key = `${sub.title}-${sub.telegram_username}`.toLowerCase();
          existingMap.set(key, true);
        });
      }
      
      const { data, error } = await supabase.functions.invoke('import-subscriptions');
      
      if (error) throw error;
      
      // Filter out subscriptions that already exist
      const newSubs = (data || []).filter((sub: any) => {
        const key = `${sub.title}-${sub.telegram_username}`.toLowerCase();
        return !existingMap.has(key);
      });
      
      if (newSubs.length === 0) {
        toast({
          title: "Nenhum anúncio novo",
          description: "Todos os anúncios já estão importados."
        });
        return;
      }
      
      // Insert new subscriptions
      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert(newSubs);
      
      if (insertError) throw insertError;
      
      toast({
        title: "Anúncios importados",
        description: `${newSubs.length} novos anúncios foram importados com sucesso!`
      });

      // Force page reload to show new data
      window.location.reload();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro ao importar anúncios",
        description: err.message || "Ocorreu um erro ao importar os anúncios."
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Get current date and time formatted for display
  const getCurrentDateTime = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return now.toLocaleDateString('pt-BR', options);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-2">
          <div className="flex justify-between items-center">
            <Button 
              variant="ghost" 
              className="font-medium px-3"
              onClick={() => navigate('/')}
            >
              <Home className="h-4 w-4 mr-2" /> 
              Início
            </Button>
            <div className="flex gap-2">
              {authState.user ? (
                <>
                  {isAdmin() && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate('/admin')}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Admin
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSignOut}
                  >
                    <User className="h-4 w-4 mr-1" />
                    Sair
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/auth')}
                >
                  <User className="h-4 w-4 mr-1" />
                  Entrar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <header className="bg-gradient-indigo text-white py-4 sm:py-6">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex justify-center items-center mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-center">🍿 Só Falta a Pipoca</h1>
          </div>
          <p className="text-center text-base sm:text-lg mt-1">Assinaturas premium com preços exclusivos</p>
          
          {/* Botões de Anunciar e Fale Conosco */}
          <div className="flex gap-2 sm:gap-3 mx-auto max-w-xs sm:max-w-sm mt-4">
            {authState.user ? (
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    className="flex-1 flex flex-col items-center justify-center h-16 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium py-2 px-3 transition-all duration-200 hover:-translate-y-1"
                  >
                    <Plus className="h-5 w-5 mb-1" />
                    <span className="text-xs sm:text-sm">Cadastrar Anúncio</span>
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-lg">
                  <SheetHeader>
                    <SheetTitle>Cadastrar Anúncio</SheetTitle>
                    <SheetDescription>
                      Cadastre seu anúncio para aprovação de um administrador.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-4">
                    <SubmissionForm />
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <a 
                href="/auth" 
                className="flex-1 flex flex-col items-center justify-center h-16 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium py-2 px-3 transition-all duration-200 hover:-translate-y-1"
              >
                <Megaphone className="h-5 w-5 mb-1" />
                <span className="text-xs sm:text-sm">Cadastre-se para Anunciar</span>
              </a>
            )}
            <a 
              href="https://wa.me/5513992077804" 
              target="_blank"
              className="flex-1 flex flex-col items-center justify-center h-16 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium py-2 px-3 transition-all duration-200 hover:-translate-y-1"
            >
              <MessageSquare className="h-5 w-5 mb-1" />
              <span className="text-xs sm:text-sm">Fale Conosco</span>
            </a>
          </div>
          
          {authState.user && isAdmin() && (
            <div className="mt-4 flex justify-center">
              <Button
                size="sm"
                variant="outline"
                className="bg-white/20 text-white border-white/40 hover:bg-white/30"
                onClick={importSubscriptions}
                disabled={isImporting}
              >
                {isImporting ? 'Importando...' : 'Importar Anúncios'}
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-5 sm:py-8">
        <SearchBar onSearch={handleSearch} />
        
        {hasResults ? (
          <SubscriptionList 
            subscriptionRefs={subscriptionRefs} 
            searchTerm={searchTerm}
            setHasResults={setHasResults}
          />
        ) : (
          <NoResults />
        )}
      </main>

      <footer className="bg-gray-800 text-white py-3 sm:py-4">
        <div className="container mx-auto px-3 sm:px-4 text-center">
          <p className="text-sm sm:text-base">&copy; 2025 Só Falta a Pipoca. Todos os direitos reservados.</p>
          <p className="text-xs text-gray-400 mt-1">v1.2.0 • Atualizado em: {getCurrentDateTime()}</p>
        </div>
      </footer>
    </div>
  );
};

// Componente de formulário para envio de anúncios
interface FormData {
  title: string;
  price: string;
  paymentMethod: string;
  status: string;
  access: string;
  whatsappNumber: string;
  telegramUsername: string;
  pixQrCode?: File | null;
  headerColor: string;  // Adicionando campos que faltavam
  priceColor: string;   // Adicionando campos que faltavam
}

const SubmissionForm: React.FC = () => {
  const { authState } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    price: '',
    paymentMethod: '',
    status: '',
    access: '',
    whatsappNumber: '',
    telegramUsername: '',
    pixQrCode: null,
    headerColor: 'bg-blue-600', // Valor padrão
    priceColor: 'text-blue-600'  // Valor padrão
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
        pixQrCode: e.target.files![0]
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
      const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${
        String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
      
      // Upload PIX QR code if provided
      let pixQrCodeUrl = null;
      if (formData.pixQrCode) {
        // First, check if storage bucket exists and create if not
        const { data: buckets } = await supabase.storage.listBuckets();
        if (!buckets?.some(bucket => bucket.name === 'pix-qrcodes')) {
          await supabase.storage.createBucket('pix-qrcodes', {
            public: false
          });
        }
        
        // Upload the file
        const fileName = `${authState.user.id}_${Date.now()}_${formData.pixQrCode.name}`;
        const { data, error: uploadError } = await supabase.storage
          .from('pix-qrcodes')
          .upload(fileName, formData.pixQrCode);
          
        if (uploadError) throw uploadError;
        
        // Get the URL
        const { data: { publicUrl } } = supabase.storage
          .from('pix-qrcodes')
          .getPublicUrl(fileName);
          
        pixQrCodeUrl = publicUrl;
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
          pix_qr_code: pixQrCodeUrl,
          added_date: formattedDate
        });
      
      if (error) throw error;
      
      toast({
        title: "Anúncio enviado",
        description: "Seu anúncio foi enviado para aprovação."
      });
      
      // Reset form
      setFormData({
        title: '',
        price: '',
        paymentMethod: '',
        status: '',
        access: '',
        whatsappNumber: '',
        telegramUsername: '',
        pixQrCode: null,
        headerColor: 'bg-blue-600',
        priceColor: 'text-blue-600'
      });
      setPriceValue('');
      
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
    <form onSubmit={handleSubmit} className="space-y-4 p-2">
      <div>
        <label className="block text-sm font-medium">Título *</label>
        <input 
          type="text" 
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ex: NETFLIX PREMIUM"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium">Preço *</label>
        <input 
          type="text" 
          name="price"
          value={priceValue}
          onChange={handlePriceChange}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="R$ 0,00"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium">Forma de Pagamento *</label>
        <input 
          type="text" 
          name="paymentMethod"
          value={formData.paymentMethod}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ex: PIX"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium">Status *</label>
        <input 
          type="text" 
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ex: Assinado (3 vagas)"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium">Tipo de Acesso *</label>
        <select 
          name="access"
          value={formData.access}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">Selecione o tipo de acesso</option>
          <option value="CONVITE POR E-MAIL">CONVITE POR E-MAIL</option>
          <option value="LOGIN E SENHA">LOGIN E SENHA</option>
          <option value="ATIVAÇÃO">ATIVAÇÃO</option>
          <option value="CONVITE">CONVITE</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium">QR Code PIX (obrigatório)</label>
        <input 
          type="file" 
          name="pixQrCode"
          accept="image/*"
          onChange={handleFileChange}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        />
        <p className="text-xs text-gray-500 mt-1">Envie o QR Code do seu PIX para facilitar o pagamento.</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium">Número WhatsApp *</label>
        <input 
          type="text" 
          name="whatsappNumber"
          value={formData.whatsappNumber}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ex: 5511999999999"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium">Username Telegram *</label>
        <input 
          type="text" 
          name="telegramUsername"
          value={formData.telegramUsername}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ex: usuariotelegram"
          required
        />
      </div>
      
      {/* Adicionar campos para as cores */}
      <div>
        <label className="block text-sm font-medium">Cor do Cabeçalho</label>
        <select 
          name="headerColor"
          value={formData.headerColor}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="bg-blue-600">Azul</option>
          <option value="bg-red-600">Vermelho</option>
          <option value="bg-green-600">Verde</option>
          <option value="bg-purple-600">Roxo</option>
          <option value="bg-yellow-600">Amarelo</option>
          <option value="bg-pink-600">Rosa</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium">Cor do Preço</label>
        <select 
          name="priceColor"
          value={formData.priceColor}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="text-blue-600">Azul</option>
          <option value="text-red-600">Vermelho</option>
          <option value="text-green-600">Verde</option>
          <option value="text-purple-600">Roxo</option>
          <option value="text-yellow-600">Amarelo</option>
          <option value="text-pink-600">Rosa</option>
        </select>
      </div>
      
      <div className="pt-4">
        <Button 
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar Anúncio para Aprovação'}
        </Button>
      </div>
    </form>
  );
};

export default Index;
