
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare } from "lucide-react";
import MessageCard from "@/components/messages/MessageCard";
import MessageResponseForm, { ResponseFormValues } from "@/components/messages/MessageResponseForm";
import { useMessages } from "@/hooks/useMessages";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileMessagesTabProps {}

const ProfileMessagesTab: React.FC<ProfileMessagesTabProps> = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [deletingMessage, setDeletingMessage] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const {
    messages,
    markAsRead,
    deleteMessage,
    sendResponse
  } = useMessages(false, authState.user?.id);

  const handleDeleteMessage = async (messageId: string) => {
    setDeletingMessage(messageId);
    await deleteMessage(messageId);
    setDeletingMessage(null);
  };

  const handleSendResponse = async (data: ResponseFormValues, messageId: string) => {
    setActionInProgress('message-response');
    await sendResponse(messageId, data.response, false);
    setActionInProgress(null);
    setRespondingTo(null);
  };

  return (
    <>
      <h2 className="text-xl font-medium mb-4">Minhas Mensagens</h2>
      {messages.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Você ainda não enviou nenhuma mensagem.</p>
            <Button
              className="mt-4"
              onClick={() => navigate('/contact')}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Enviar Mensagem
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="space-y-4">
              <MessageCard
                message={message}
                isAdmin={false}
                onMarkAsRead={markAsRead}
                onDelete={handleDeleteMessage}
                onReply={setRespondingTo}
                deletingMessage={deletingMessage}
              />

              {respondingTo === message.id && (
                <div className="ml-8">
                  <MessageResponseForm
                    onSubmit={(data) => handleSendResponse(data, message.id)}
                    onCancel={() => setRespondingTo(null)}
                    isSubmitting={actionInProgress === 'message-response'}
                    placeholder="Digite sua resposta à administração..."
                    submitLabel="Enviar Resposta"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default ProfileMessagesTab;
