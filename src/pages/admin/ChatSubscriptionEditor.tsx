
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { addSubscription } from '@/services/subscription-service';

const ChatSubscriptionEditor = () => {
  const navigate = useNavigate();
  const [chatText, setChatText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChatText(e.target.value);
  };

  const parseSubscriptionFromChat = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    // Estrutura esperada para cada campo
    const fieldMap: { [key: string]: string } = {
      '🖥': 'title',
      '🏦': 'price',
      '📌': 'status',
      '🔐': 'access',
      '📩': 'telegram',
      '📱': 'whatsapp',
      '📅': 'date'
    };

    const subscriptionData: { [key: string]: string } = {
      headerColor: 'bg-indigo-700', // Default values
      priceColor: 'text-indigo-600',
      icon: 'monitor'
    };

    // Extrair dados do chat
    for (const line of lines) {
      for (const [emoji, field] of Object.entries(fieldMap)) {
        if (line.startsWith(emoji)) {
          let value = line.substring(emoji.length).trim();
          
          // Tratamentos específicos
          if (field === 'telegram') {
            // Extrair apenas o username sem @
            const match = value.match(/@(\w+)/);
            subscriptionData['telegramUsername'] = match ? match[1] : value;
          } 
          else if (field === 'whatsapp') {
            // Tentar extrair o número de telefone de uma URL ou texto simples
            if (value.includes('wa.me/')) {
              const match = value.match(/wa\.me\/(\d+)/);
              subscriptionData['whatsappNumber'] = match ? match[1] : '';
            } else {
              subscriptionData['whatsappNumber'] = value.replace(/\D/g, '');
            }
          }
          else if (field === 'price') {
            subscriptionData['price'] = value;
            // Extrair método de pagamento entre parênteses se existir
            const paymentMatch = value.match(/\(([^)]+)\)/);
            if (paymentMatch) {
              subscriptionData['paymentMethod'] = paymentMatch[1];
            } else {
              subscriptionData['paymentMethod'] = 'PIX';
            }
          }
          else if (field === 'date') {
            // Extrair data após "Adicionado em:"
            const dateMatch = value.match(/Adicionado em:\s*(.+)/i);
            subscriptionData['addedDate'] = dateMatch ? dateMatch[1] : new Date().toLocaleDateString('pt-BR');
          }
          else {
            subscriptionData[field] = value;
          }
          
          break;
        }
      }
    }

    // Verificar campos obrigatórios
    const requiredFields = ['title', 'price', 'status', 'access', 'telegramUsername', 'whatsappNumber'];
    for (const field of requiredFields) {
      if (!subscriptionData[field]) {
        throw new Error(`Campo obrigatório não encontrado: ${field}`);
      }
    }

    return {
      title: subscriptionData.title,
      price: subscriptionData.price,
      paymentMethod: subscriptionData.paymentMethod || 'PIX',
      status: subscriptionData.status,
      access: subscriptionData.access,
      headerColor: subscriptionData.headerColor,
      priceColor: subscriptionData.priceColor,
      whatsappNumber: subscriptionData.whatsappNumber,
      telegramUsername: subscriptionData.telegramUsername,
      icon: subscriptionData.icon,
      addedDate: subscriptionData.addedDate || new Date().toLocaleDateString('pt-BR'),
      featured: false,
      code: ''
    };
  };

  const handleSubmit = async () => {
    if (!chatText.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira o texto do chat.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const subscriptionData = parseSubscriptionFromChat(chatText);
      
      await addSubscription(subscriptionData);
      
      toast({
        title: "Sucesso",
        description: "Assinatura criada com sucesso!",
      });
      
      navigate('/admin/subscriptions');
    } catch (error) {
      console.error("Erro ao criar assinatura:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar assinatura.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Adicionar Assinatura via Chat">
      <div className="max-w-3xl mx-auto">
        <div className="mb-4">
          <h2 className="text-lg font-medium">Adicionar Nova Assinatura (Formato Chat)</h2>
          <p className="text-sm text-gray-500">
            Cole o texto do chat no formato abaixo para criar uma nova assinatura automaticamente.
          </p>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="chatText" className="block text-sm font-medium mb-1">
                  Texto do Chat
                </label>
                <Textarea
                  id="chatText"
                  value={chatText}
                  onChange={handleTextChange}
                  placeholder={`🖥 ChatGPT Plus\n🏦 R$ 24 - PIX (Mensal)\n📌 Assinado\n🔐 Email e Senha\n📩 @alessadinozzo\n📱 https://wa.me/5587991988684\n\n📅 Adicionado em: 10/05/2025`}
                  className="h-60"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/subscriptions')}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enviando...' : 'Adicionar Assinatura'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ChatSubscriptionEditor;
