
import React from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

// Mesmo schema usado em Profile.tsx
const profileFormSchema = z.object({
  email: z.string().email({ message: "E-mail inválido" }).min(1, { message: "E-mail é obrigatório" }),
  username: z.string().min(3, { message: "Nome de usuário deve ter pelo menos 3 caracteres" }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfilePersonalDataFormProps {
  profileForm: UseFormReturn<ProfileFormValues>;
  onUpdateProfile: (data: ProfileFormValues) => Promise<void>;
  actionInProgress: string | null;
}

const ProfilePersonalDataForm: React.FC<ProfilePersonalDataFormProps> = ({
  profileForm,
  onUpdateProfile,
  actionInProgress,
}) => {
  return (
    <Form {...profileForm}>
      <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-4">
        <FormField
          control={profileForm.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input disabled {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={profileForm.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome de Usuário</FormLabel>
              <FormControl>
                <Input placeholder="Seu nome de usuário" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full"
          disabled={actionInProgress === 'profile'}
        >
          {actionInProgress === 'profile' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Atualizando...
            </>
          ) : (
            'Salvar alterações'
          )}
        </Button>
      </form>
    </Form>
  );
};

export default ProfilePersonalDataForm;
