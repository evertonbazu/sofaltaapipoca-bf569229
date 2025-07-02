import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2 } from "lucide-react";
import { SubscriptionData } from "@/types/subscriptionTypes";

interface Props {
  userSubscriptions: SubscriptionData[];
  actionInProgress: string | null;
  handleDeleteSubscription: (id: string) => void;
  navigate: (to: string) => void;
  onRefresh: () => void;
}

const ProfileSubscriptionsList: React.FC<Props> = ({
  userSubscriptions,
  actionInProgress,
  handleDeleteSubscription,
  navigate,
  onRefresh,
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
            <Card key={subscription.id} className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg font-bold uppercase text-primary">
                    {subscription.title}
                  </CardTitle>
                  {subscription.featured && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      ⭐ Destaque
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-base font-medium">
                  {subscription.price} - {subscription.paymentMethod}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Envio:</span>
                    <span className="font-medium uppercase">{subscription.access}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Status:</span>
                    <Badge variant={subscription.status === 'Assinado' ? 'default' : 'secondary'}>
                      {subscription.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Adicionado em:</span>
                    <span className="text-sm">
                      {subscription.addedDate || "N/A"}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Código:</span>
                    <Badge variant="outline" className="font-mono">
                      {subscription.code}
                    </Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-3">
                <div className="flex gap-2 w-full">
                  <Button
                    variant="destructive"
                    className="flex-1"
                    disabled={!!actionInProgress}
                    onClick={() => handleDeleteSubscription(subscription.id || '')}
                  >
                    {actionInProgress === subscription.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

export default ProfileSubscriptionsList;