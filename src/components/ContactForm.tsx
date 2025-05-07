
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const { toast } = useToast();
  const { authState } = useAuth();

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      // Store message in database
      const { error: dbError } = await supabase
        .from('contact_messages')
        .insert({
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message,
          user_id: authState.user?.id
        });

      if (dbError) throw new Error(dbError.message);

      // Send email via edge function
      const { error: emailError } = await supabase.functions.invoke('send-contact-email', {
        body: {
          ...data,
          userId: authState.user?.id
        }
      });

      if (emailError) throw new Error(emailError.message);

      // Success
      setSubmitSuccess(true);
      toast({
        title: "Mensagem enviada com sucesso!",
        description: "Retornaremos seu contato em breve.",
      });
      reset();
    } catch (error: any) {
      console.error("Error submitting contact form:", error);
      toast({
        variant: "destructive",
        title: "Erro ao enviar mensagem",
        description: error.message || "Ocorreu um erro ao enviar sua mensagem. Tente novamente mais tarde.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {submitSuccess ? (
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
          <h3 className="text-2xl font-bold">Mensagem Enviada!</h3>
          <p className="text-gray-600 max-w-md">
            Obrigado por entrar em contato conosco. Retornaremos sua mensagem o mais breve possível.
          </p>
          <Button onClick={() => setSubmitSuccess(false)}>Enviar nova mensagem</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              {...register("name", { required: "Nome é obrigatório" })}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" /> {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register("email", { 
                required: "Email é obrigatório",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Endereço de email inválido"
                }
              })}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" /> {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Assunto *</Label>
            <Input
              id="subject"
              {...register("subject", { required: "Assunto é obrigatório" })}
              className={errors.subject ? "border-red-500" : ""}
            />
            {errors.subject && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" /> {errors.subject.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem *</Label>
            <Textarea
              id="message"
              {...register("message", { required: "Mensagem é obrigatória" })}
              rows={5}
              className={errors.message ? "border-red-500" : ""}
            />
            {errors.message && (
              <p className="text-sm text-red-500 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" /> {errors.message.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : "Enviar Mensagem"}
          </Button>
        </form>
      )}
    </div>
  );
};

export default ContactForm;
