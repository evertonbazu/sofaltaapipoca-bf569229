
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Send, Copy } from 'lucide-react';
import { addSubscription } from '@/services/subscription-service';
import { Textarea } from "@/components/ui/textarea";
import { SubscriptionData } from '@/types/subscriptionTypes';
import { supabase } from '@/integrations/supabase/client';

const ChatSubscriptionEditor = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Verificar se é administrador
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: isAdminData, error } = await supabase.rpc('is_admin');
        if (error) throw error;
        setIsAdmin(isAdminData);
      } catch (error) {
        console.error('Erro ao verificar status de admin:', error);
      }
    };
    
    checkAdminStatus();
  }, []);

  // Exemplo de formato de mensagem
  const exampleFormat = `🖥Título: NETFLIX PREMIUM
🏦Preço: R$30,00
🫱🏼‍🫲🏼Método de Pagamento: PIX (MENSAL)
📌Status: ASSINADO
🔐Envio: LOGIN E SENHA
📩Usuário do Telegram: @usuario
📱Número do WhatsApp: +5513996422303

📅 Adicionado em: ${new Date().toLocaleDateString('pt-BR')}`;

  // Copiar exemplo para a área de transferência
  const copyExample = () => {
    navigator.clipboard.writeText(exampleFormat);
    toast({
      title: "Exemplo copiado",
      description: "O formato de exemplo foi copiado para a área de transferência.",
    });
  };

  // Processar mensagem
  const processMessage = async () => {
    if (!message.trim()) {
      toast({
        title: "Mensagem vazia",
        description: "Por favor, insira uma mensagem para processar.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Extrair informações da mensagem
      const extractInfo = (key: string, defaultValue: string = ''): string => {
        const regex = new RegExp(`${key}:\\s*([^\\n]+)`, 'i');
        const match = message.match(regex);
        return match ? match[1].trim() : defaultValue;
      };
      
      // Checar se tem todos os campos necessários
      const title = extractInfo('Título');
      const price = extractInfo('Preço');
      const paymentMethod = extractInfo('Método de Pagamento');
      const status = extractInfo('Status');
      const access = extractInfo('Envio');
      const telegramUsername = extractInfo('Usuário do Telegram');
      const whatsappNumber = extractInfo('Número do WhatsApp');
      
      if (!title || !price || !paymentMethod || !status || !access || !telegramUsername || !whatsappNumber) {
        throw new Error('Formato de mensagem inválido. Verifique se todos os campos obrigatórios estão presentes.');
      }
      
      // Criar objeto de assinatura
      const subscription: SubscriptionData = {
        title,
        price,
        paymentMethod,
        status,
        access,
        telegramUsername: telegramUsername.startsWith('@') ? telegramUsername.substring(1) : telegramUsername,
        whatsappNumber: whatsappNumber.replace(/[^0-9+]/g, ''),
        featured: false,
        headerColor: 'bg-blue-600',
        priceColor: 'text-blue-600',
        addedDate: new Date().toLocaleDateString('pt-BR')
      };
      
      // Adicionar assinatura
      await addSubscription(subscription);
      
      toast({
        title: "Assinatura adicionada",
        description: "A assinatura foi adicionada com sucesso através do chat.",
      });
      
      // Limpar mensagem
      setMessage('');
    } catch (error: any) {
      console.error('Erro ao processar mensagem:', error);
      toast({
        title: "Erro ao processar",
        description: error.message || "Ocorreu um erro ao processar a mensagem. Verifique o formato e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAdmin) {
    return (
      <AdminLayout title="Chat Assinaturas">
        <Card>
          <CardContent className="p-6">
            <p>Você não tem permissão para acessar esta página.</p>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Chat Assinaturas">
      <Card>
        <CardContent className="p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Adicionar Assinatura via Chat</h2>
            <p className="text-gray-500 mb-4">
              Cole ou digite a mensagem de chat no formato especificado para adicionar uma nova assinatura.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-md mb-4 relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={copyExample}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <h3 className="font-medium mb-2">Formato de exemplo:</h3>
              <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-60">
                {exampleFormat}
              </pre>
            </div>
            
            <Textarea
              placeholder="Cole a mensagem do chat aqui..."
              className="min-h-[200px]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            
            <div className="flex justify-end mt-4">
              <Button onClick={processMessage} disabled={isProcessing}>
                <Send className="h-4 w-4 mr-2" />
                {isProcessing ? 'Processando...' : 'Processar Mensagem'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default ChatSubscriptionEditor;
