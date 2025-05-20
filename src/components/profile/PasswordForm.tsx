
import React from 'react';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { PasswordFormValues } from '@/pages/Profile';

interface PasswordFormComponentProps {
  form: UseFormReturn<PasswordFormValues>;
  onSubmit: (data: PasswordFormValues) => Promise<void>;
  isSubmitting: boolean;
  onLogout: () => Promise<void>;
}

const PasswordFormComponent: React.FC<PasswordFormComponentProps> = ({ 
  form, 
  onSubmit, 
  isSubmitting,
  onLogout
}) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nova Senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="******" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirme a Nova Senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="******" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Atualizando...
            </>
          ) : (
            'Alterar senha'
          )}
        </Button>
      </form>
      <div className="mt-4">
        <Button variant="outline" className="w-full" onClick={onLogout}>
          Sair da conta
        </Button>
      </div>
    </Form>
  );
};

export default PasswordFormComponent;
