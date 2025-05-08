
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Trash, MessageSquare } from 'lucide-react';

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
  const [viewMessageOpen, setViewMessageOpen] = useState(false);
  const [deleteMessageOpen, setDeleteMessageOpen] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<ContactMessage | null>(null);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    if (selectAll) {
      setSelectedMessages(messages.map(msg => msg.id));
    } else {
      setSelectedMessages([]);
    }
  }, [selectAll, messages]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setMessages(data || []);
    } catch (error: any) {
      console.error("Error fetching contact messages:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar mensagens",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewMessage = (message: ContactMessage) => {
    setCurrentMessage(message);
    setViewMessageOpen(true);
  };

  const handleDeleteMessage = (message: ContactMessage) => {
    setCurrentMessage(message);
    setDeleteMessageOpen(true);
  };

  const handleSelectMessage = (id: string) => {
    setSelectedMessages(prev => 
      prev.includes(id) 
        ? prev.filter(msgId => msgId !== id)
        : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedMessages.length === 0) {
      toast({
        variant: "destructive",
        title: "Nenhuma mensagem selecionada",
        description: "Por favor, selecione pelo menos uma mensagem para excluir."
      });
      return;
    }
    
    setBulkDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!currentMessage) return;
    
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', currentMessage.id);
      
      if (error) throw error;
      
      // Update local state
      setMessages(prev => prev.filter(msg => msg.id !== currentMessage.id));
      
      toast({
        title: "Mensagem excluída",
        description: "A mensagem foi excluída com sucesso."
      });
      
      setDeleteMessageOpen(false);
    } catch (error: any) {
      console.error("Error deleting message:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir mensagem",
        description: error.message
      });
    }
  };

  const confirmBulkDelete = async () => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .in('id', selectedMessages);
      
      if (error) throw error;
      
      // Update local state
      setMessages(prev => prev.filter(msg => !selectedMessages.includes(msg.id)));
      
      // Clear selection
      setSelectedMessages([]);
      setSelectAll(false);
      
      toast({
        title: "Mensagens excluídas",
        description: `${selectedMessages.length} mensagens foram excluídas com sucesso.`
      });
      
      setBulkDeleteOpen(false);
    } catch (error: any) {
      console.error("Error bulk deleting messages:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir mensagens",
        description: error.message
      });
    }
  };

  const handleSort = (key: string) => {
    setSortConfig(prevConfig => {
      if (prevConfig.key === key) {
        // If same key, toggle direction
        return {
          key,
          direction: prevConfig.direction === 'asc' ? 'desc' : 'asc'
        };
      } else {
        // If different key, default to ascending
        return { key, direction: 'asc' };
      }
    });
  };

  const getSortedMessages = () => {
    const filtered = messages.filter(msg => 
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return [...filtered].sort((a, b) => {
      if (sortConfig.key === 'created_at') {
        const dateA = a[sortConfig.key] ? new Date(a[sortConfig.key]).getTime() : 0;
        const dateB = b[sortConfig.key] ? new Date(b[sortConfig.key]).getTime() : 0;
        
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      const valA = a[sortConfig.key]?.toString().toLowerCase() || '';
      const valB = b[sortConfig.key]?.toString().toLowerCase() || '';
      
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mensagens de Contato</h1>
      </div>
      
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="w-full max-w-sm">
          <Input 
            placeholder="Buscar mensagens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSort('created_at')}
            className={sortConfig.key === 'created_at' ? 'border-blue-500' : ''}
          >
            Data {sortConfig.key === 'created_at' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSort('name')}
            className={sortConfig.key === 'name' ? 'border-blue-500' : ''}
          >
            Nome {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSort('subject')}
            className={sortConfig.key === 'subject' ? 'border-blue-500' : ''}
          >
            Assunto {sortConfig.key === 'subject' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </Button>
        </div>
      </div>

      <div className="flex justify-end">
        {selectedMessages.length > 0 && (
          <Button 
            variant="destructive"
            onClick={handleBulkDelete}
            className="flex items-center gap-1"
          >
            <Trash className="h-4 w-4" /> 
            Excluir Selecionados ({selectedMessages.length})
          </Button>
        )}
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox 
                    checked={selectAll} 
                    onCheckedChange={(checked) => setSelectAll(!!checked)} 
                  />
                </TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Assunto</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getSortedMessages().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                    Nenhuma mensagem encontrada
                  </TableCell>
                </TableRow>
              ) : (
                getSortedMessages().map((message) => (
                  <TableRow key={message.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedMessages.includes(message.id)}
                        onCheckedChange={() => handleSelectMessage(message.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{message.name}</TableCell>
                    <TableCell>{message.email}</TableCell>
                    <TableCell>{message.subject}</TableCell>
                    <TableCell>
                      {message.created_at 
                        ? new Date(message.created_at).toLocaleDateString() + ' ' + 
                          new Date(message.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewMessage(message)}
                        className="inline-flex items-center"
                      >
                        <MessageSquare className="h-4 w-4 mr-1" /> Ver
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteMessage(message)}
                        className="text-red-500 hover:text-red-700 hover:border-red-300 inline-flex items-center"
                      >
                        <Trash className="h-4 w-4 mr-1" /> Excluir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* View Message Dialog */}
      <Dialog open={viewMessageOpen} onOpenChange={setViewMessageOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{currentMessage?.subject}</DialogTitle>
            <DialogDescription>
              De {currentMessage?.name} ({currentMessage?.email})
              <div className="text-xs text-gray-500 mt-1">
                {currentMessage?.created_at 
                  ? new Date(currentMessage.created_at).toLocaleString() 
                  : 'N/A'}
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Card>
              <CardContent className="pt-6 whitespace-pre-wrap">
                {currentMessage?.message}
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewMessageOpen(false)}>Fechar</Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                setViewMessageOpen(false);
                setCurrentMessage(currentMessage);
                setDeleteMessageOpen(true);
              }}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Message Dialog */}
      <AlertDialog open={deleteMessageOpen} onOpenChange={setDeleteMessageOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta mensagem? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão em massa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir {selectedMessages.length} mensagens selecionadas? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkDelete} className="bg-red-500 hover:bg-red-600">
              Excluir {selectedMessages.length} mensagens
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ContactMessages;
