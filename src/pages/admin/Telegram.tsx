import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, ExternalLink, Trash2, RefreshCw, Edit, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';
import { getTelegramMessages, deleteTelegramMessage, editTelegramMessage, editTelegramMessageFormatted } from '@/services/telegram-admin';

interface TelegramMessage {
  id: string;
  message_id: number;
  subscription_id: string;
  sent_at: string;
  deleted_at?: string;
  subscription?: {
    title: string;
    customTitle?: string;
    price: string;
    status: string;
    code: string;
    visible: boolean;
  };
}

/**
 * Página de gerenciamento do Telegram para administradores
 * @version 3.9.5
 */
const Telegram: React.FC = () => {
  const [messages, setMessages] = useState<TelegramMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMessage, setEditingMessage] = useState<TelegramMessage | null>(null);
  const [editText, setEditText] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const { toast } = useToast();

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await getTelegramMessages();
      setMessages(data);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar mensagens do Telegram",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleDelete = async (messageId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta mensagem do Telegram?')) return;

    try {
      await deleteTelegramMessage(messageId);
      toast({
        title: "Sucesso",
        description: "Mensagem excluída do Telegram"
      });
      loadMessages();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir mensagem",
        variant: "destructive"
      });
    }
  };

  const handleEdit = async () => {
    if (!editingMessage) return;

    try {
      setEditLoading(true);
      await editTelegramMessageFormatted(editingMessage.message_id, editingMessage.subscription_id);
      toast({
        title: "Sucesso",
        description: "Mensagem atualizada no Telegram com formatação completa"
      });
      setEditingMessage(null);
      setEditText('');
      loadMessages();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao editar mensagem",
        variant: "destructive"
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditCustom = async () => {
    if (!editingMessage || !editText.trim()) return;

    try {
      setEditLoading(true);
      await editTelegramMessage(editingMessage.message_id, editText);
      toast({
        title: "Sucesso",
        description: "Mensagem editada no Telegram"
      });
      setEditingMessage(null);
      setEditText('');
      loadMessages();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao editar mensagem",
        variant: "destructive"
      });
    } finally {
      setEditLoading(false);
    }
  };

  const openEditDialog = (message: TelegramMessage) => {
    setEditingMessage(message);
    // Generate preview text for editing
    const subscription = message.subscription;
    if (subscription) {
      const displayTitle = subscription.customTitle || subscription.title;
      const previewText = `🍿 ${displayTitle}\n💰 ${subscription.price}\n📱 Status: ${subscription.status}\n🔸 Código: ${subscription.code}`;
      setEditText(previewText);
    }
  };

  const filteredMessages = messages.filter(message => {
    const subscription = message.subscription;
    if (!subscription) return false;
    
    const searchLower = searchTerm.toLowerCase();
    const title = (subscription.customTitle || subscription.title).toLowerCase();
    const code = subscription.code.toLowerCase();
    
    return title.includes(searchLower) || code.includes(searchLower);
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getTelegramGroupUrl = (messageId: number) => {
    // This would need the actual group username/ID from site config
    return `https://t.me/c/YOUR_GROUP_ID/${messageId}`;
  };

  return (
    <AdminLayout title="Gerenciar Telegram">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por título ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button onClick={loadMessages} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Messages Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Enviado em</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Carregando mensagens...
                  </TableCell>
                </TableRow>
              ) : filteredMessages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Nenhuma mensagem encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredMessages.map((message) => {
                  const subscription = message.subscription;
                  if (!subscription) return null;

                  return (
                    <TableRow key={message.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {subscription.customTitle || subscription.title}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {subscription.price}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{subscription.code}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={subscription.status === 'Assinado' ? 'default' : 'secondary'}
                        >
                          {subscription.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(message.sent_at)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={message.deleted_at ? 'destructive' : subscription.visible ? 'default' : 'secondary'}
                        >
                          {message.deleted_at ? 'Excluída' : subscription.visible ? 'Ativa' : 'Oculta'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(getTelegramGroupUrl(message.message_id), '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditDialog(message)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Editar Mensagem do Telegram</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Textarea
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  placeholder="Conteúdo da mensagem..."
                                  rows={10}
                                />
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => setEditingMessage(null)}
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    variant="outline" 
                                    onClick={handleEditCustom}
                                    disabled={editLoading || !editText.trim()}
                                  >
                                    {editLoading ? 'Salvando...' : 'Editar Texto'}
                                  </Button>
                                  <Button
                                    onClick={handleEdit}
                                    disabled={editLoading}
                                  >
                                    {editLoading ? 'Salvando...' : 'Atualizar Formatado'}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          {!message.deleted_at && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(message.message_id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Telegram;