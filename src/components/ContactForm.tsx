
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Form validation schema
const contactFormSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  email: z.string().email('Email inválido'),
  subject: z.string().min(1, 'O assunto é obrigatório'),
  message: z.string().min(10, 'A mensagem deve ter pelo menos 10 caracteres'),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const ContactForm: React.FC = () => {
  const { toast } = useToast();
  const { authState } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: authState.user?.username || '',
      email: authState.user?.email || '',
      subject: '',
      message: '',
    }
  });
  
  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      // First store the message in the database
      const { error: dbError } = await supabase
        .from('contact_messages')
        .insert({
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message,
          user_id: authState.user?.id || null
        });
      
      if (dbError) throw new Error(dbError.message);
      
      // Then send the email using the edge function
      const { error: emailError } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message
        }
      });
      
      if (emailError) throw new Error(emailError.message);
      
      // Show success message
      setSuccess(true);
      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso. Agradecemos seu contato!"
      });
      
      // Reset the form
      reset({
        name: authState.user?.username || '',
        email: authState.user?.email || '',
        subject: '',
        message: ''
      });
      
    } catch (err: any) {
      console.error('Error submitting contact form:', err);
      setError(err.message || 'Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente.');
      toast({
        variant: "destructive",
        title: "Erro ao enviar mensagem",
        description: err.message || 'Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <AlertDescription>Sua mensagem foi enviada com sucesso. Agradecemos seu contato!</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input 
          id="name" 
          {...register('name')} 
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email" 
          {...register('email')} 
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="subject">Assunto</Label>
        <Input 
          id="subject" 
          {...register('subject')} 
          className={errors.subject ? 'border-red-500' : ''}
        />
        {errors.subject && (
          <p className="text-red-500 text-sm">{errors.subject.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="message">Mensagem</Label>
        <Textarea 
          id="message" 
          rows={5} 
          {...register('message')} 
          className={errors.message ? 'border-red-500' : ''}
        />
        {errors.message && (
          <p className="text-red-500 text-sm">{errors.message.message}</p>
        )}
      </div>
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Mail className="mr-2 h-4 w-4" />
            Enviar Mensagem
          </>
        )}
      </Button>
    </form>
  );
};

export default ContactForm;
