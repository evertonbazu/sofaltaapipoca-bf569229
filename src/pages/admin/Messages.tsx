import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Mail } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import MessageCard from '@/components/messages/MessageCard';
import MessageResponseForm, { ResponseFormValues } from '@/components/messages/MessageResponseForm';
import { useMessages } from '@/hooks/useMessages';

/**
 * Página de gerenciamento de mensagens no painel administrativo
 * @version 5.1.0
 */
const Messages = () => {
  const { messages, isLoading, markAsRead, deleteMessage, sendResponse } = useMessages(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingMessage, setDeletingMessage] = useState<string | null>(null);
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);

  const handleMarkAsRead = async (messageId: string) => {
    setMarkingAsRead(messageId);
    await markAsRead(messageId);
    setMarkingAsRead(null);
  };

  const handleDeleteMessage = async (messageId: string) => {
    setDeletingMessage(messageId);
    await deleteMessage(messageId);
    setDeletingMessage(null);
  };

  const handleSendResponse = async (data: ResponseFormValues, messageId: string) => {
    setIsSubmitting(true);
    await sendResponse(messageId, data.response, true);
    setIsSubmitting(false);
    setRespondingTo(null);
  };

  return (
    <AdminLayout title="Gerenciar Mensagens">
      <div className="mb-4">
        <h2 className="text-lg font-medium">Mensagens de Contato</h2>
        <p className="text-sm text-gray-500">
          Visualize e responda às mensagens enviadas pelos usuários.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Carregando mensagens...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma mensagem encontrada.</p>
              </CardContent>
            </Card>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="space-y-4">
                <MessageCard
                  message={message}
                  isAdmin={true}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDeleteMessage}
                  onRespond={setRespondingTo}
                  markingAsRead={markingAsRead}
                  deletingMessage={deletingMessage}
                />
                
                {respondingTo === message.id && (
                  <div className="ml-8">
                    <MessageResponseForm
                      onSubmit={(data) => handleSendResponse(data, message.id)}
                      onCancel={() => setRespondingTo(null)}
                      isSubmitting={isSubmitting}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default Messages;
