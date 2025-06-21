
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import SubscriptionForm from '@/components/admin/SubscriptionForm';
import { getSubscription, updateSubscription, deleteSubscription } from '@/services/subscription-service';
import { SubscriptionData } from '@/types/subscriptionTypes';
import { Button } from "@/components/ui/button";
import { Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

/**
 * Página para editar assinaturas no painel administrativo
 * @version 3.8.0
 */
const SubscriptionEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadSubscription = async () => {
      if (id) {
        setIsLoading(true);
        try {
          const data = await getSubscription(id);
          setSubscription(data);
        } catch (error) {
          console.error("Erro ao carregar assinatura:", error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar os detalhes da assinatura.",
            variant: "destructive",
          });
          navigate('/admin/subscriptions');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadSubscription();
  }, [id, navigate, toast]);

  const handleSave = async (data: SubscriptionData) => {
    setIsSaving(true);
    try {
      if (id) {
        await updateSubscription(id, data);
        toast({
          title: "Sucesso",
          description: "Assinatura atualizada com sucesso.",
        });
        navigate('/admin/subscriptions');
      }
    } catch (error) {
      console.error("Erro ao atualizar assinatura:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a assinatura.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (id) {
        await deleteSubscription(id);
        toast({
          title: "Sucesso",
          description: "Assinatura excluída com sucesso.",
        });
        navigate('/admin/subscriptions');
      }
    } catch (error) {
      console.error("Erro ao excluir assinatura:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a assinatura.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title="Editar Assinatura">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Carregando assinatura...</span>
        </div>
      </AdminLayout>
    );
  }

  if (!subscription) {
    return (
      <AdminLayout title="Editar Assinatura">
        <div className="flex justify-center items-center h-64">
          <span>Assinatura não encontrada.</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Editar Assinatura">
      <div className="space-y-4">
        <Button variant="outline" onClick={() => navigate('/admin/subscriptions')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para a Lista
        </Button>

        <SubscriptionForm
          initialValues={subscription}
          onSubmit={handleSave}
          isLoading={isSaving}
          onCancel={() => navigate('/admin/subscriptions')}
        />

        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Excluindo...
            </>
          ) : (
            <>
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir Assinatura
            </>
          )}
        </Button>
      </div>
    </AdminLayout>
  );
};

export default SubscriptionEditor;
