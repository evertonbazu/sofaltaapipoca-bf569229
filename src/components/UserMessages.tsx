
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getUserMessages, getMessageReplies, replyToMessage, markMessageAsRead } from '@/services/contact-service';
import { useNotifications } from '@/contexts/NotificationContext';

interface Message {
  id: string;
  subject: string;
  message: string;
  created_at: string;
  read: boolean;
}

interface Reply {
  id: string;
  reply_text: string;
  created_at: string;
  admin_name: string;
}

const UserMessages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  const [replies, setReplies] = useState<{ [key: string]: Reply[] }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [newReply, setNewReply] = useState<string>('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isSendingReply, setIsSendingReply] = useState(false);
  
  const { authState } = useAuth();
  const { toast } = useToast();
  const { refreshNotifications } = useNotifications();

  useEffect(() => {
    if (authState.user?.id) {
      loadMessages();
    }
  }, [authState.user?.id]);

  const loadMessages = async () => {
    if (!authState.user?.id) return;
    
    setIsLoading(true);
    try {
      const messagesData = await getUserMessages(authState.user.id);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMessageExpand = async (messageId: string, isRead: boolean) => {
    // If already expanded, collapse it
    if (expandedMessage === messageId) {
      setExpandedMessage(null);
      return;
    }

    setExpandedMessage(messageId);

    // Load replies if not already loaded
    if (!replies[messageId]) {
      try {
        const repliesData = await getMessageReplies(messageId);
        setReplies(prev => ({
          ...prev,
          [messageId]: repliesData
        }));

        // Mark as read if not already read
        if (!isRead) {
          await markMessageAsRead(messageId);
          
          // Update local message state
          setMessages(prev => 
            prev.map(msg => 
              msg.id === messageId ? { ...msg, read: true } : msg
            )
          );
          
          // Refresh notification counters
          refreshNotifications();
        }
      } catch (error) {
        console.error('Error loading replies:', error);
      }
    }
  };

  const handleReply = async (messageId: string) => {
    if (!newReply.trim()) {
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
      
      await replyToMessage(messageId, authState.user.id, newReply);
      
      // Refresh replies
      const repliesData = await getMessageReplies(messageId);
      setReplies(prev => ({
        ...prev,
        [messageId]: repliesData
      }));
      
      // Reset form
      setNewReply('');
      setReplyingTo(null);
      
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Você ainda não enviou nenhuma mensagem.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <Card key={message.id} className={!message.read ? "border-l-4 border-l-blue-500" : ""}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{message.subject}</CardTitle>
                <CardDescription>
                  {formatDistanceToNow(new Date(message.created_at), { 
                    addSuffix: true,
                    locale: ptBR
                  })}
                </CardDescription>
              </div>
              {!message.read && <Badge>Nova</Badge>}
            </div>
          </CardHeader>
          
          <CardContent className="pb-2">
            <p className="text-sm text-gray-700">{message.message}</p>
            
            {expandedMessage === message.id && (
              <div className="mt-4 space-y-4">
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Respostas:</h4>
                  
                  {replies[message.id]?.length > 0 ? (
                    <div className="space-y-3">
                      {replies[message.id].map((reply) => (
                        <div key={reply.id} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-sm">{reply.admin_name}</span>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(reply.created_at), { 
                                addSuffix: true,
                                locale: ptBR
                              })}
                            </span>
                          </div>
                          <p className="text-sm">{reply.reply_text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Nenhuma resposta ainda.</p>
                  )}
                </div>
                
                {replyingTo === message.id ? (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Sua resposta:</h4>
                    <Textarea 
                      value={newReply}
                      onChange={(e) => setNewReply(e.target.value)}
                      placeholder="Digite sua resposta..."
                      className="mb-2"
                    />
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setReplyingTo(null)}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleReply(message.id)}
                        disabled={isSendingReply}
                      >
                        {isSendingReply ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Enviar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center border-t pt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setReplyingTo(message.id)}
                    >
                      Responder
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="pt-0 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleMessageExpand(message.id, message.read)}
              className="flex items-center"
            >
              {expandedMessage === message.id ? (
                <>Recolher <ChevronUp className="ml-1 h-4 w-4" /></>
              ) : (
                <>Expandir <ChevronDown className="ml-1 h-4 w-4" /></>
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default UserMessages;
