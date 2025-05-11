
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash, Save, ArrowDown, ArrowUp } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";

interface FormOption {
  id: string;
  type: string;
  label: string;
  value: string;
  position: number;
  active: boolean;
}

const FormOptions = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<FormOption[]>([]);
  const [accessMethods, setAccessMethods] = useState<FormOption[]>([]);
  const [statusOptions, setStatusOptions] = useState<FormOption[]>([]);
  const [newOption, setNewOption] = useState<{
    type: string;
    label: string;
    value: string;
  }>({
    type: 'payment_method',
    label: '',
    value: ''
  });

  // Buscar as opções do banco de dados
  useEffect(() => {
    const fetchOptions = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('form_options')
          .select('*')
          .order('position', { ascending: true });
        
        if (error) throw error;
        
        if (data) {
          setPaymentMethods(data.filter(option => option.type === 'payment_method'));
          setAccessMethods(data.filter(option => option.type === 'access_method'));
          setStatusOptions(data.filter(option => option.type === 'status'));
        }
      } catch (error) {
        console.error('Erro ao buscar opções:', error);
        toast({
          title: "Erro ao carregar",
          description: "Não foi possível carregar as opções de formulário.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOptions();
  }, [toast]);

  // Adicionar nova opção
  const handleAddOption = async () => {
    if (!newOption.label || !newOption.value) {
      toast({
        title: "Campos incompletos",
        description: "Preencha o rótulo e o valor para adicionar uma nova opção.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      let currentOptions: FormOption[];
      
      switch(newOption.type) {
        case 'payment_method':
          currentOptions = paymentMethods;
          break;
        case 'access_method':
          currentOptions = accessMethods;
          break;
        case 'status':
          currentOptions = statusOptions;
          break;
        default:
          currentOptions = [];
      }
      
      const nextPosition = currentOptions.length > 0 
        ? Math.max(...currentOptions.map(o => o.position)) + 1 
        : 1;
      
      const { data, error } = await supabase
        .from('form_options')
        .insert({
          type: newOption.type,
          label: newOption.label,
          value: newOption.value,
          position: nextPosition,
          active: true
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        switch(newOption.type) {
          case 'payment_method':
            setPaymentMethods([...paymentMethods, data]);
            break;
          case 'access_method':
            setAccessMethods([...accessMethods, data]);
            break;
          case 'status':
            setStatusOptions([...statusOptions, data]);
            break;
        }
        
        setNewOption({
          type: newOption.type,
          label: '',
          value: ''
        });
        
        toast({
          title: "Opção adicionada",
          description: "A nova opção foi adicionada com sucesso.",
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar opção:', error);
      toast({
        title: "Erro ao adicionar",
        description: "Não foi possível adicionar a nova opção.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar opção
  const handleUpdateOption = async (option: FormOption) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('form_options')
        .update({
          label: option.label,
          value: option.value,
          active: option.active,
          updated_at: new Date().toISOString()
        })
        .eq('id', option.id);
      
      if (error) throw error;
      
      toast({
        title: "Opção atualizada",
        description: "A opção foi atualizada com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar opção:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar a opção.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Excluir opção
  const handleDeleteOption = async (id: string, type: string) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('form_options')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Atualizar a lista local
      switch(type) {
        case 'payment_method':
          setPaymentMethods(paymentMethods.filter(option => option.id !== id));
          break;
        case 'access_method':
          setAccessMethods(accessMethods.filter(option => option.id !== id));
          break;
        case 'status':
          setStatusOptions(statusOptions.filter(option => option.id !== id));
          break;
      }
      
      toast({
        title: "Opção excluída",
        description: "A opção foi excluída com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao excluir opção:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a opção.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Mover opção para cima ou para baixo
  const handleMoveOption = async (
    option: FormOption,
    direction: 'up' | 'down',
    options: FormOption[],
    setOptions: React.Dispatch<React.SetStateAction<FormOption[]>>
  ) => {
    const currentIndex = options.findIndex(o => o.id === option.id);
    
    if (
      (direction === 'up' && currentIndex === 0) || 
      (direction === 'down' && currentIndex === options.length - 1)
    ) {
      return; // Já está no topo ou no final
    }
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const targetOption = options[newIndex];
    
    setIsLoading(true);
    
    try {
      // Trocar as posições no banco de dados
      const updates = [
        supabase
          .from('form_options')
          .update({ position: targetOption.position })
          .eq('id', option.id),
          
        supabase
          .from('form_options')
          .update({ position: option.position })
          .eq('id', targetOption.id)
      ];
      
      const results = await Promise.all(updates);
      
      if (results.some(result => result.error)) {
        throw results.find(result => result.error)?.error;
      }
      
      // Atualizar a lista local
      const newOptions = [...options];
      [newOptions[currentIndex].position, newOptions[newIndex].position] = 
        [newOptions[newIndex].position, newOptions[currentIndex].position];
      
      newOptions.sort((a, b) => a.position - b.position);
      setOptions(newOptions);
    } catch (error) {
      console.error('Erro ao reordenar opções:', error);
      toast({
        title: "Erro ao reordenar",
        description: "Não foi possível reordenar as opções.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizar tabela de opções
  const renderOptionsTable = (
    options: FormOption[],
    setOptions: React.Dispatch<React.SetStateAction<FormOption[]>>,
    title: string
  ) => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          Gerencie as opções disponíveis para seleção no formulário.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rótulo</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead className="w-[100px]">Ativo</TableHead>
              <TableHead className="w-[180px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {options.map((option) => (
              <TableRow key={option.id}>
                <TableCell>
                  <Input
                    value={option.label}
                    onChange={(e) => {
                      const updatedOptions = options.map(o =>
                        o.id === option.id ? { ...o, label: e.target.value } : o
                      );
                      setOptions(updatedOptions);
                    }}
                    onBlur={() => handleUpdateOption(option)}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={option.value}
                    onChange={(e) => {
                      const updatedOptions = options.map(o =>
                        o.id === option.id ? { ...o, value: e.target.value } : o
                      );
                      setOptions(updatedOptions);
                    }}
                    onBlur={() => handleUpdateOption(option)}
                  />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={option.active}
                    onCheckedChange={(checked) => {
                      const updatedOption = { ...option, active: checked };
                      const updatedOptions = options.map(o =>
                        o.id === option.id ? updatedOption : o
                      );
                      setOptions(updatedOptions);
                      handleUpdateOption(updatedOption);
                    }}
                  />
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleMoveOption(option, 'up', options, setOptions)}
                    disabled={options.indexOf(option) === 0 || isLoading}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleMoveOption(option, 'down', options, setOptions)}
                    disabled={options.indexOf(option) === options.length - 1 || isLoading}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteOption(option.id, option.type)}
                    disabled={isLoading}
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout title="Opções de Formulário">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Nova Opção</CardTitle>
            <CardDescription>
              Crie novas opções para o formulário de cadastro de assinaturas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Tabs
                  defaultValue="payment_method"
                  onValueChange={(value) => setNewOption({ ...newOption, type: value })}
                >
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="payment_method">Pagamento</TabsTrigger>
                    <TabsTrigger value="access_method">Acesso</TabsTrigger>
                    <TabsTrigger value="status">Status</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div>
                <Input
                  placeholder="Rótulo"
                  value={newOption.label}
                  onChange={(e) => setNewOption({ ...newOption, label: e.target.value })}
                  className="mb-2"
                />
              </div>
              <div>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Valor"
                    value={newOption.value}
                    onChange={(e) => setNewOption({ ...newOption, value: e.target.value })}
                  />
                  <Button
                    onClick={handleAddOption}
                    disabled={isLoading || !newOption.label || !newOption.value}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                    Adicionar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="payment_methods" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="payment_methods">Formas de Pagamento</TabsTrigger>
            <TabsTrigger value="access_methods">Métodos de Acesso</TabsTrigger>
            <TabsTrigger value="status_options">Status</TabsTrigger>
          </TabsList>
          
          <TabsContent value="payment_methods">
            {isLoading && paymentMethods.length === 0 ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              renderOptionsTable(
                paymentMethods,
                setPaymentMethods,
                "Formas de Pagamento"
              )
            )}
          </TabsContent>
          
          <TabsContent value="access_methods">
            {isLoading && accessMethods.length === 0 ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              renderOptionsTable(
                accessMethods,
                setAccessMethods,
                "Métodos de Acesso"
              )
            )}
          </TabsContent>
          
          <TabsContent value="status_options">
            {isLoading && statusOptions.length === 0 ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              renderOptionsTable(
                statusOptions,
                setStatusOptions,
                "Status"
              )
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default FormOptions;
