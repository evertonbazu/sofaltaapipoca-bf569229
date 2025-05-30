
import React from 'react';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const responseFormSchema = z.object({
  response: z.string().min(10, { message: "Resposta deve ter pelo menos 10 caracteres" }),
});

export type ResponseFormValues = z.infer<typeof responseFormSchema>;

interface MessageResponseFormProps {
  onSubmit: (data: ResponseFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  placeholder?: string;
  submitLabel?: string;
}

/**
 * Formulário para responder mensagens
 * @version 1.1.0
 */
const MessageResponseForm: React.FC<MessageResponseFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting,
  placeholder = "Digite sua resposta aqui...",
  submitLabel = "Enviar Resposta"
}) => {
  const form = useForm<ResponseFormValues>({
    resolver: zodResolver(responseFormSchema),
    defaultValues: {
      response: "",
    },
  });

  const handleSubmit = (data: ResponseFormValues) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="response"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sua Resposta</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={placeholder}
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex gap-2">
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              submitLabel
            )}
          </Button>
          <Button 
            type="button" 
            variant="outline"
            onClick={() => {
              onCancel();
              form.reset();
            }}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MessageResponseForm;
