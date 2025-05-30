
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Eye, EyeOff, Trash2, Reply } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  response?: string;
  read: boolean;
  created_at: string;
  responded_at?: string;
  user_id?: string;
}

interface MessageCardProps {
  message: ContactMessage;
  isAdmin?: boolean;
  onMarkAsRead?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  onReply?: (messageId: string) => void;
  onRespond?: (messageId: string) => void;
  markingAsRead?: string | null;
  deletingMessage?: string | null;
}

/**
 * Componente para exibir uma mensagem individual
 * @version 1.0.0
 */
const MessageCard: React.FC<MessageCardProps> = ({
  message,
  isAdmin = false,
  onMarkAsRead,
  onDelete,
  onReply,
  onRespond,
  markingAsRead,
  deletingMessage
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <Card className={!message.read && message.response ? 'border-blue-200 bg-blue-50' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            {!message.read && message.response && <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />}
            <Mail className="mr-2 h-4 w-4" />
            {message.subject}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {isAdmin && !message.read && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMarkAsRead?.(message.id)}
                disabled={markingAsRead === message.id}
              >
                {markingAsRead === message.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-1" />
                    Marcar como lida
                  </>
                )}
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete?.(message.id)}
              disabled={deletingMessage === message.id}
            >
              {deletingMessage === message.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
            {isAdmin && message.read && <EyeOff className="h-4 w-4 text-gray-400" />}
          </div>
        </div>
        <CardDescription>
          {isAdmin ? (
            <>De: {message.name} ({message.email}) • {formatDate(message.created_at)}</>
          ) : (
            <>Enviado em: {formatDate(message.created_at)}</>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">{isAdmin ? 'Mensagem:' : 'Sua Mensagem:'}</h4>
            <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded">
              {message.message}
            </p>
          </div>

          {message.response && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">
                {isAdmin ? 'Sua Resposta:' : 'Resposta da Administração:'}
              </h4>
              <p className={`text-gray-700 whitespace-pre-wrap p-3 rounded ${
                isAdmin 
                  ? 'bg-gray-50' 
                  : 'bg-blue-50 border-l-4 border-blue-500'
              }`}>
                {message.response}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Respondido em: {message.responded_at ? formatDate(message.responded_at) : ''}
              </p>
              
              {!isAdmin && !message.read && (
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onMarkAsRead?.(message.id)}
                  >
                    Marcar como lida
                  </Button>
                </div>
              )}

              {!isAdmin && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReply?.(message.id)}
                  >
                    <Reply className="mr-2 h-4 w-4" />
                    Responder
                  </Button>
                </div>
              )}
            </div>
          )}

          {!message.response && isAdmin && (
            <div>
              <Button
                variant="outline"
                onClick={() => onRespond?.(message.id)}
              >
                <Reply className="mr-2 h-4 w-4" />
                Responder
              </Button>
            </div>
          )}

          {!message.response && !isAdmin && (
            <div className="border-t pt-4">
              <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                Aguardando resposta da administração...
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MessageCard;
