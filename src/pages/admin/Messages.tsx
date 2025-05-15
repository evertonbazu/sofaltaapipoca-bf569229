
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Loader2, Search, Send, Mail, MailOpen, Reply } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { getAllMessages, getMessageReplies, markMessageAsRead, replyToMessage } from '@/services/contact-service';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNotifications } from '@/contexts/NotificationContext';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  created_at: string;
}

interface Reply {
  id: string;
  reply_text: string;
  created_at: string;
  admin_name: string;
}

const Messages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [messageReplies, setMessageReplies] = useState<Reply[]>([]);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { authState } = useAuth();
  const { toast } = useToast();
  const { refreshNotifications } = useNotifications();

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredMessages(messages);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredMessages(
        messages.filter(
          msg => 
            msg.name.toLowerCase().includes(term) ||
            msg.email.toLowerCase().includes(term) ||
            msg.subject.toLowerCase().includes(term) ||
            msg.message.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, messages]);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const messagesData = await getAllMessages();
      setMessages(messagesData);
      setFilteredMessages(messagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as mensagens",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openMessageDialog = async (message: Message) => {
    setSelectedMessage(message);
    setIsDialogOpen(true);
    setReplyText('');
    
    try {
      // Load replies
      const replies = await getMessageReplies(message.id);
      setMessageReplies(replies);
      
      // Mark as read if not read
      if (!message.read) {
        await markMessageAsRead(message.id);
        
        // Update local state
        setMessages(prev => 
          prev.map(msg => 
            msg.id === message.id ? { ...msg, read: true } : msg
          )
        );
        setFilteredMessages(prev => 
          prev.map(msg => 
            msg.id === message.id ? { ...msg, read: true } : msg
          )
        );
        
        // Refresh notification counters
        refreshNotifications();
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  };

  const handleSendReply = async () => {
    if (!selectedMessage) return;
    if (!replyText.trim()) {
      toast({
        title: "Erro",
        description: "O texto da resposta não pode estar vazio",
        variant: "destructive"
      });
      return;
    }
    
    setIsSendingReply(true);
    try {
      if (!authState.user?.id) throw new Error("Usuário não autenticado");
      
      await replyToMessage(selectedMessage.id, authState.user.id, replyText);
      
      // Refresh replies
      const replies = await getMessageReplies(selectedMessage.id);
      setMessageReplies(replies);
      
      // Reset form
      setReplyText('');
      
      toast({
        title: "Sucesso",
        description: "Resposta enviada com sucesso",
      });
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a resposta",
        variant: "destructive"
      });
    } finally {
      setIsSendingReply(false);
    }
  };

  return (
    <AdminLayout title="Gerenciar Mensagens">
      <div className="space-y-4">
        <Card className="p-4">
          <div className="flex flex-wrap gap-2 mb-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                placeholder="Buscar mensagens..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => {
                setSearchTerm('');
                loadMessages();
              }}
            >
              Atualizar
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredMessages.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Assunto</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.map((message) => (
                    <TableRow key={message.id} className={!message.read ? "bg-blue-50" : ""}>
                      <TableCell>
                        {message.read ? 
                          <MailOpen className="h-4 w-4 text-gray-400" /> : 
                          <Mail className="h-4 w-4 text-blue-500" />
                        }
                      </TableCell>
                      <TableCell>{message.name}</TableCell>
                      <TableCell>{message.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {message.subject}
                          {!message.read && <Badge className="ml-2">Nova</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(message.created_at), { 
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openMessageDialog(message)}
                          className="flex items-center"
                        >
                          <Reply className="mr-1 h-4 w-4" />
                          Ver/Responder
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">Nenhuma mensagem encontrada</p>
            </div>
          )}
        </Card>

        {/* Dialog to view and reply to messages */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            {selectedMessage && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedMessage.subject}</DialogTitle>
                  <DialogDescription>
                    De: {selectedMessage.name} ({selectedMessage.email})
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-4">
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <p className="text-sm">{selectedMessage.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatDistanceToNow(new Date(selectedMessage.created_at), { 
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </p>
                  </div>
                  
                  {/* Previous replies */}
                  {messageReplies.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Respostas anteriores:</h4>
                      <div className="space-y-2">
                        {messageReplies.map(reply => (
                          <div key={reply.id} className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">{reply.admin_name}</span>
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(reply.created_at), { 
                                  addSuffix: true,
                                  locale: ptBR
                                })}
                              </span>
                            </div>
                            <p className="text-sm mt-1">{reply.reply_text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Reply form */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Sua resposta:</h4>
                    <Textarea 
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Digite sua resposta..."
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Fechar
                  </Button>
                  <Button 
                    onClick={handleSendReply}
                    disabled={isSendingReply || !replyText.trim()}
                  >
                    {isSendingReply ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Enviar Resposta
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default Messages;
