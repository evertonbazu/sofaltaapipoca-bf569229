
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, CreditCard, Shield, Key, Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import NavBar from '@/components/NavBar';
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionData } from '@/types/subscriptionTypes';

const SubscriptionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!id) {
        setError('ID da assinatura não fornecido');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('id', id)
          .eq('visible', true)
          .single();

        if (error) {
          console.error('Erro ao buscar assinatura:', error);
          setError('Assinatura não encontrada');
        } else {
          setSubscription({
            id: data.id,
            title: data.title,
            customTitle: data.custom_title,
            price: data.price,
            paymentMethod: data.payment_method,
            status: data.status,
            access: data.access,
            headerColor: data.header_color,
            priceColor: data.price_color,
            whatsappNumber: data.whatsapp_number,
            telegramUsername: data.telegram_username,
            icon: data.icon,
            addedDate: data.added_date,
            featured: data.featured,
            code: data.code,
            pixKey: data.pix_key,
            category: data.category,
            isMemberSubmission: data.user_id ? true : false,
            visible: data.visible
          });
        }
      } catch (err) {
        console.error('Erro ao buscar assinatura:', err);
        setError('Erro ao carregar a assinatura');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [id]);

  const getWhatsappLink = () => {
    if (!subscription?.whatsappNumber) return '#';
    return `https://wa.me/${subscription.whatsappNumber}`;
  };

  const getTelegramLink = () => {
    if (!subscription?.telegramUsername) return '#';
    const cleanUsername = subscription.telegramUsername.startsWith('@') 
      ? subscription.telegramUsername.substring(1) 
      : subscription.telegramUsername;
    return `https://telegram.me/${cleanUsername}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <NavBar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !subscription) {
    return (
      <div className="min-h-screen bg-gray-100">
        <NavBar />
        <div className="container mx-auto px-4 py-8">
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="mr-2" size={20} />
            Voltar para página inicial
          </Link>
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-red-600 text-lg">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      
      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="mr-2" size={20} />
          Voltar para página inicial
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Card Principal */}
          <Card className="h-fit">
            <CardHeader className={`${subscription.headerColor} text-white relative`}>
              <CardTitle className="text-2xl font-bold flex items-center justify-center">
                🖥 {subscription.customTitle || subscription.title}
              </CardTitle>
              
              {subscription.featured && (
                <div className="absolute top-4 right-4">
                  <span className="text-yellow-300 text-xl">⭐</span>
                </div>
              )}
              
              {subscription.isMemberSubmission && (
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="text-xs bg-green-600 text-white">
                    Membro
                  </Badge>
                </div>
              )}
            </CardHeader>
            
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center">
                  <CreditCard className="mr-3 text-gray-600" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Valor</p>
                    <p className={`font-semibold text-lg ${subscription.priceColor}`}>
                      {subscription.price}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <CreditCard className="mr-3 text-gray-600" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Forma de Pagamento</p>
                    <p className="font-medium">{subscription.paymentMethod}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Shield className="mr-3 text-gray-600" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium">{subscription.status}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Key className="mr-3 text-gray-600" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Envio</p>
                    <p className="font-medium">{subscription.access}</p>
                  </div>
                </div>

                {subscription.addedDate && (
                  <div className="flex items-center">
                    <Calendar className="mr-3 text-gray-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Adicionado em</p>
                      <p className="font-medium">{subscription.addedDate}</p>
                    </div>
                  </div>
                )}

                {subscription.code && (
                  <div className="flex items-center">
                    <span className="mr-3 text-gray-600">#</span>
                    <div>
                      <p className="text-sm text-gray-500">Código</p>
                      <p className="font-medium font-mono">{subscription.code}</p>
                    </div>
                  </div>
                )}

                {subscription.category && (
                  <div className="pt-2">
                    <Badge variant="outline">{subscription.category}</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card de Contato */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-xl">Entre em Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600 mb-4">
                Para mais informações ou para adquirir esta assinatura, entre em contato através dos canais abaixo:
              </p>

              {subscription.whatsappNumber && (
                <Button 
                  asChild 
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <a href={getWhatsappLink()} target="_blank" rel="noopener noreferrer">
                    <Phone className="mr-2" size={20} />
                    Contatar via WhatsApp
                  </a>
                </Button>
              )}

              {subscription.telegramUsername && (
                <Button 
                  asChild 
                  variant="outline" 
                  className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <a href={getTelegramLink()} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2" size={20} />
                    Contatar via Telegram
                  </a>
                </Button>
              )}

              {subscription.pixKey && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-2">Chave PIX</p>
                  <p className="font-mono text-sm break-all">{subscription.pixKey}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDetails;
