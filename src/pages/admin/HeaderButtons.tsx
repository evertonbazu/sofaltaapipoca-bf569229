
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Pencil, Trash2, Plus, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';
import { getHeaderButtons, addHeaderButton, updateHeaderButton, deleteHeaderButton } from '@/services/subscription-service';

interface HeaderButton {
  id: string;
  title: string;
  icon: string;
  url: string;
  visible: boolean;
  position: number;
}

const HeaderButtons = () => {
  const [buttons, setButtons] = useState<HeaderButton[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentButton, setCurrentButton] = useState<HeaderButton | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    icon: '',
    url: '',
    visible: true,
    position: 0
  });
  const [buttonToDelete, setButtonToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchHeaderButtons();
  }, []);

  const fetchHeaderButtons = async () => {
    setIsLoading(true);
    try {
      const data = await getHeaderButtons();
      setButtons(data);
    } catch (error) {
      console.error('Erro ao buscar botões de cabeçalho:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os botões de cabeçalho.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData({
      ...formData,
      visible: checked,
    });
  };

  const openAddDialog = () => {
    setCurrentButton(null);
    setFormData({
      title: '',
      icon: '',
      url: '',
      visible: true,
      position: buttons.length
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (button: HeaderButton) => {
    setCurrentButton(button);
    setFormData({
      title: button.title,
      icon: button.icon,
      url: button.url,
      visible: button.visible,
      position: button.position
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setButtonToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (currentButton) {
        // Editando um botão existente
        await updateHeaderButton(currentButton.id, formData);
        toast({
          title: 'Sucesso',
          description: 'Botão atualizado com sucesso!',
        });
      } else {
        // Adicionando um novo botão
        await addHeaderButton(formData);
        toast({
          title: 'Sucesso',
          description: 'Botão adicionado com sucesso!',
        });
      }
      
      setIsDialogOpen(false);
      fetchHeaderButtons();
    } catch (error) {
      console.error('Erro ao salvar botão:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o botão. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!buttonToDelete) return;
    
    try {
      await deleteHeaderButton(buttonToDelete);
      toast({
        title: 'Sucesso',
        description: 'Botão excluído com sucesso!',
      });
      
      setIsDeleteDialogOpen(false);
      fetchHeaderButtons();
    } catch (error) {
      console.error('Erro ao excluir botão:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o botão. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const toggleVisibility = async (button: HeaderButton) => {
    try {
      await updateHeaderButton(button.id, { ...button, visible: !button.visible });
      fetchHeaderButtons();
      
      toast({
        title: 'Sucesso',
        description: `Botão ${button.visible ? 'ocultado' : 'exibido'} com sucesso!`,
      });
    } catch (error) {
      console.error('Erro ao atualizar visibilidade:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar a visibilidade do botão.',
        variant: 'destructive',
      });
    }
  };

  const movePosition = async (button: HeaderButton, direction: 'up' | 'down') => {
    const currentIndex = button.position;
    const newPosition = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Check if the move is valid
    if (newPosition < 0 || newPosition >= buttons.length) {
      return;
    }
    
    try {
      // Find the button that needs to swap positions
      const otherButton = buttons.find(b => b.position === newPosition);
      if (!otherButton) return;
      
      // Update both buttons
      await Promise.all([
        updateHeaderButton(button.id, { ...button, position: newPosition }),
        updateHeaderButton(otherButton.id, { ...otherButton, position: currentIndex })
      ]);
      
      fetchHeaderButtons();
    } catch (error) {
      console.error('Erro ao reordenar botões:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível reordenar os botões.',
        variant: 'destructive',
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gerenciar Botões do Cabeçalho</h1>
          <Button onClick={openAddDialog} className="flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Botão
          </Button>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">Carregando botões...</div>
        ) : buttons.length > 0 ? (
          <div className="bg-white rounded-md shadow overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Posição</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Ícone</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Visível</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buttons.sort((a, b) => a.position - b.position).map((button) => (
                  <TableRow key={button.id}>
                    <TableCell className="flex items-center space-x-2">
                      <span>{button.position + 1}</span>
                      <div className="flex flex-col">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          disabled={button.position === 0}
                          onClick={() => movePosition(button, 'up')}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          disabled={button.position === buttons.length - 1}
                          onClick={() => movePosition(button, 'down')}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{button.title}</TableCell>
                    <TableCell>{button.icon}</TableCell>
                    <TableCell className="truncate max-w-[200px]">{button.url}</TableCell>
                    <TableCell>{button.visible ? 'Sim' : 'Não'}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => toggleVisibility(button)}
                          title={button.visible ? 'Ocultar' : 'Mostrar'}
                        >
                          {button.visible ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditDialog(button)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openDeleteDialog(button.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="bg-white rounded-md shadow p-8 text-center">
            <p className="text-gray-500">Nenhum botão de cabeçalho encontrado.</p>
            <Button onClick={openAddDialog} className="mt-4">
              Adicionar Primeiro Botão
            </Button>
          </div>
        )}
        
        {/* Dialog para adicionar/editar botão */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{currentButton ? 'Editar Botão' : 'Adicionar Botão'}</DialogTitle>
              <DialogDescription>
                {currentButton
                  ? 'Edite os detalhes do botão do cabeçalho'
                  : 'Preencha os detalhes do novo botão do cabeçalho'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">
                  Ícone (formato emoji, ex: 🏠, 📞, 📰)
                </Label>
                <Input
                  id="icon"
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL (começando com / para links internos)</Label>
                <Input
                  id="url"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="visible"
                  checked={formData.visible}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="visible">Visível</Label>
              </div>
              <DialogFooter>
                <Button type="submit">
                  {currentButton ? 'Salvar Alterações' : 'Adicionar Botão'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        
        {/* Dialog para confirmação de exclusão */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. O botão será permanentemente excluído.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default HeaderButtons;
