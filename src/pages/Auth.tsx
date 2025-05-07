
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare } from 'lucide-react';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import VerificationMessage from '@/components/auth/VerificationMessage';

const Auth: React.FC = () => {
  const { authState } = useAuth();
  const [activeTab, setActiveTab] = useState('signin');
  const [showVerifyMessage, setShowVerifyMessage] = useState(false);
  const navigate = useNavigate();

  // Check if user is already authenticated
  useEffect(() => {
    if (authState.session && !authState.isLoading) {
      navigate('/');
    }
  }, [authState.session, authState.isLoading, navigate]);

  // Redirect authenticated users to home page
  if (authState.session && !authState.isLoading) {
    return <Navigate to="/" />;
  }

  if (authState.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-gradient-indigo text-white py-4 sm:py-6">
        <div className="container mx-auto px-3 sm:px-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-center">🍿 Só Falta a Pipoca</h1>
          <p className="text-center text-base sm:text-lg mt-2">Assinaturas premium com preços exclusivos</p>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Welcome</CardTitle>
            <CardDescription className="text-center">
              {activeTab === 'signin' 
                ? 'Log in to access your account' 
                : 'Create your account to get started'
              }
            </CardDescription>
          </CardHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="signin">Log in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              {showVerifyMessage && <VerificationMessage />}
              <LoginForm setShowVerifyMessage={setShowVerifyMessage} />
            </TabsContent>
            
            <TabsContent value="signup">
              <SignupForm 
                setShowVerifyMessage={setShowVerifyMessage} 
                setActiveTab={setActiveTab}
              />
            </TabsContent>
          </Tabs>
          
          <div className="px-8 pb-6 pt-2">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <MessageSquare className="h-4 w-4" />
              <a href="https://wa.me/5513992077804" className="text-blue-600 hover:underline">Need help?</a>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
