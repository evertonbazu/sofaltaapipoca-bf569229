import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { LogIn, Settings, User, Plus, Copy, Mail } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionData } from '@/types/subscriptionTypes';
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { generateSubscriptionCode } from '@/utils/codeGenerator';

const Index: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [navLinks, setNavLinks] = useState<any[]>([]);
  const { authState } = useAuth();

  useEffect(() => {
    const fetchSubscriptions = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .order('title', { ascending: true });

        if (error) {
          console.error('Error fetching subscriptions:', error);
        } else {
          setSubscriptions(data || []);
        }
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  useEffect(() => {
    const links = [
      {
        label: 'Cadastrar Anúncio',
        icon: <Plus className="w-4 h-4" />,
        href: '/new',
        variant: 'ghost' as const,
      },
    ];

    if (authState?.user) {
      links.push({
        label: 'Meu Perfil',
        icon: <User className="w-4 h-4" />,
        href: '/profile',
        variant: 'ghost' as const,
      });

      if (authState.user.role === 'admin') {
        links.push({
          label: 'Administração',
          icon: <Settings className="w-4 h-4" />,
          href: '/admin',
          variant: 'ghost' as const,
        });
      }
    } else {
      links.push({
        label: 'Login',
        icon: <LogIn className="w-4 h-4" />,
        href: '/auth',
        variant: 'ghost' as const,
      });
    }
    
    // Add Fale Conosco link
    links.push({
      label: 'Fale Conosco',
      icon: <Mail className="w-4 h-4" />,
      href: '/contact',
      variant: 'ghost' as const,
    });

    setNavLinks(links);
  }, [authState?.user]);

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-2">
          <div className="flex justify-between items-center">
            <Link to="/" className="font-bold text-xl">
              <span className="text-blue-600">Compartilha</span><span className="text-gray-800">Aí</span>
            </Link>
            <div className="flex items-center space-x-2">
              {navLinks.map((link, index) => (
                <Button key={index} variant={link.variant} as={Link} to={link.href} className="font-medium px-3">
                  {link.icon}
                  {link.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Anúncios de Assinaturas</h1>
          <Input
            type="search"
            placeholder="Pesquisar assinatura..."
            className="max-w-md"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle><Skeleton className="h-5 w-3/4" /></CardTitle>
                  <CardDescription><Skeleton className="h-4 w-1/2" /></CardDescription>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6 mt-2" />
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-16" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredSubscriptions.map(subscription => (
              <Card key={subscription.id} className="bg-white shadow-md rounded-lg overflow-hidden">
                <CardHeader className={`p-0 ${subscription.header_color} text-white`}>
                  <CardTitle className="text-xl font-bold px-4 py-3">{subscription.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 mr-2" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.95l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                    </svg>
                    <span className="text-gray-700">{subscription.access}</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 mr-2" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 4a3 3 0 00-3 3v4c0 .61.291 1.176.776 1.584l3.497 2.8a1 1 0 001.454 0l3.497-2.8A2.995 2.995 0 0015 11V7a3 3 0 10-6 0v4a3 3 0 106 0v-3.285a1.5 1.5 0 00-.5-1.28l-3.58-2.865a3.5 3.5 0 00-4.08 0L4.5 6.435A1.5 1.5 0 004 7.785V11a3 3 0 106 0V4z"></path>
                    </svg>
                    <span className="text-gray-700">{subscription.status}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between p-4">
                  <span className={`text-2xl font-bold ${subscription.price_color}`}>{subscription.price}</span>
                  <a href={`https://wa.me/${subscription.whatsapp_number}`} target="_blank" rel="noopener noreferrer">
                    <Button>Participar</Button>
                  </a>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
