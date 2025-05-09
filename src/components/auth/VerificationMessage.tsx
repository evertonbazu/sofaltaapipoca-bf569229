
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Mail } from 'lucide-react';

const VerificationMessage: React.FC = () => {
  return (
    <Alert className="mb-4 bg-blue-50 border-blue-200">
      <Mail className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-700">Verifique seu e-mail</AlertTitle>
      <AlertDescription className="text-blue-600">
        Um link de verificação foi enviado para seu e-mail. Por favor, verifique sua caixa de entrada e clique no link para ativar sua conta.
      </AlertDescription>
    </Alert>
  );
};

export default VerificationMessage;
