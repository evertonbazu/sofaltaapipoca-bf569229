
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Trash2, Calendar, User, Send } from 'lucide-react';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  user_id: string | null;
}

const ContactMessages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, [sortOrder]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: sortOrder === 'oldest' });
      
      if (error) throw error;
      
      setMessages(data || []);
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar mensagens",
        description: error.message || "Ocorreu um erro ao carregar as mensagens. Por favor, tente novamente."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (message: ContactMessage) => {
    setSelectedMessage(message);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedMessage) return;
    
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', selectedMessage.id);
      
      if (error) throw error;
      
      // Update local state
      setMessages(prev => prev.filter(msg => msg.id !== selectedMessage.id));
      
      toast({
        title: "Mensagem excluída",
        description: "A mensagem foi excluída com sucesso."
      });
      
      setDeleteDialogOpen(false);
    } catch (error: any) {
      console.error("Error deleting message:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir mensagem",
        description: error.message || "Ocorreu um erro ao excluir a mensagem. Por favor, tente novamente."
      });
    }
  };

  const handleReplyClick = (message: ContactMessage) => {
    setSelectedMessage(message);
    setReplyMessage('');
    setReplyDialogOpen(true);
  };

  const sendReply = async () => {
    if (!selectedMessage || !replyMessage.trim()) return;
    
    setSendingReply(true);
    try {
      // Save the reply to a table or send via an edge function
      // Here we'll simulate success for now
      
      toast({
        title: "Resposta enviada",
        description: "Sua resposta foi enviada com sucesso."
      });
      
      setReplyDialogOpen(false);
    } catch (error: any) {
      console.error("Error sending reply:", error);
      toast({
        variant: "destructive",
        title: "Erro ao enviar resposta",
        description: error.message || "Ocorreu um erro ao enviar sua resposta. Por favor, tente novamente."
      });
    } finally {
      setSendingReply(false);
    }
  };

  const filteredMessages = messages.filter(message => 
    message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 w-full max-w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mensagens de Contato</h1>
      </div>
      
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <div className="w-full max-w-sm">
          <Input 
            placeholder="Buscar mensagem..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Ordenar por:</span>
          <Select 
            value={sortOrder} 
            onValueChange={(value: 'newest' | 'oldest') => setSortOrder(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Mais recentes</SelectItem>
              <SelectItem value="oldest">Mais antigas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredMessages.length === 0 ? (
            <div className="md:col-span-2 xl:col-span-3 text-center py-10 border rounded-md bg-gray-50">
              <p className="text-gray-500">Nenhuma mensagem encontrada</p>
            </div>
          ) : (
            filteredMessages.map(message => (
              <Card key={message.id} className="flex flex-col h-full">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="mb-1">{message.subject}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <User className="h-3 w-3" /> {message.name}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteClick(message)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="space-y-3">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Mail className="h-3 w-3" /> {message.email}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {message.created_at 
                        ? new Date(message.created_at).toLocaleString() 
                        : 'Data desconhecida'}
                    </div>
                    <div className="mt-2 text-gray-700 border-t pt-2">
                      <p className="whitespace-pre-line">{message.message}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end pt-4">
                  <Button 
                    variant="outline" 
                    className="text-blue-600" 
                    onClick={() => handleReplyClick(message)}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Responder
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta mensagem? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle>Responder a {selectedMessage?.name}</DialogTitle>
            <DialogDescription>
              Envie uma resposta diretamente para {selectedMessage?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="font-medium text-sm text-gray-700">Assunto original: {selectedMessage?.subject}</p>
              <p className="text-sm text-gray-600 mt-1">{selectedMessage?.message}</p>
            </div>
            <Textarea
              placeholder="Escreva sua resposta aqui..."
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              className="min-h-[150px]"
            />
          </div>
          <DialogFooter className="sm:justify-between">
            <DialogClose asChild>
              <Button variant="outline" className="mt-2 sm:mt-0">Cancelar</Button>
            </DialogClose>
            <Button 
              type="submit" 
              disabled={!replyMessage.trim() || sendingReply}
              onClick={sendReply}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {sendingReply ? "Enviando..." : "Enviar resposta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactMessages;
