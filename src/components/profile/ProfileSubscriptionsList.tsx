
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { SubscriptionData } from "@/types/subscriptionTypes";

interface Props {
  userSubscriptions: SubscriptionData[];
  actionInProgress: string | null;
  handleDeleteSubscription: (id: string) => void;
  navigate: (to: string) => void;
}

const ProfileSubscriptionsList: React.FC<Props> = ({
  userSubscriptions,
  actionInProgress,
  handleDeleteSubscription,
  navigate,
}) => {
  return (
    <>
      <h2 className="text-xl font-medium mb-4">Minhas Assinaturas</h2>
      {userSubscriptions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Você ainda não possui assinaturas aprovadas.</p>
            <Button
              className="mt-4"
              onClick={() => navigate('/')}
            >
              Voltar para a página inicial
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userSubscriptions.map((subscription) => (
            <Card key={subscription.id}>
              <CardHeader>
                <CardTitle>{subscription.title}</CardTitle>
                <CardDescription>
                  {subscription.price} - {subscription.paymentMethod}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Envio:</strong> {subscription.access}</p>
                  <p><strong>Status:</strong> {subscription.status}</p>
                  {/* Exibir a data de publicação utilizando o campo addedDate */}
                  <p>
                    <strong>Adicionado em:</strong>{" "}
                    {subscription.addedDate
                      ? subscription.addedDate
                      : "N/A"}
                  </p>
                  <p><strong>Código:</strong> {subscription.code}</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="destructive"
                  className="w-full"
                  disabled={!!actionInProgress}
                  onClick={() => handleDeleteSubscription(subscription.id || '')}
                >
                  {actionInProgress === subscription.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir Assinatura
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

export default ProfileSubscriptionsList;
