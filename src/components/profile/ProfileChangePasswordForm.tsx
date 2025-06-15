
import React from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

// Mesmo schema usado em Profile.tsx
const passwordFormSchema = z.object({
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

interface ProfileChangePasswordFormProps {
  passwordForm: UseFormReturn<PasswordFormValues>;
  onUpdatePassword: (data: PasswordFormValues) => Promise<void>;
  actionInProgress: string | null;
  handleLogout: () => Promise<void>;
}

const ProfileChangePasswordForm: React.FC<ProfileChangePasswordFormProps> = ({
  passwordForm,
  onUpdatePassword,
  actionInProgress,
  handleLogout,
}) => {
  return (
    <>
      <Form {...passwordForm}>
        <form onSubmit={passwordForm.handleSubmit(onUpdatePassword)} className="space-y-4">
          <FormField
            control={passwordForm.control}
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
            control={passwordForm.control}
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
            disabled={actionInProgress === 'password'}
          >
            {actionInProgress === 'password' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Atualizando...
              </>
            ) : (
              'Alterar senha'
            )}
          </Button>
        </form>
      </Form>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          Sair da conta
        </Button>
      </CardFooter>
    </>
  );
};

export default ProfileChangePasswordForm;
