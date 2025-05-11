
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Pencil, Trash2, Plus, ArrowUp, ArrowDown, Save, X } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { HeaderButton } from '@/types/subscriptionTypes';
import { getAllHeaderButtons, addHeaderButton, updateHeaderButton, deleteHeaderButton } from '@/services/subscription-service';

const HeaderButtons = () => {
  const [buttons, setButtons] = useState<HeaderButton[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [buttonToDelete, setButtonToDelete] = useState<string | null>(null);
  const [editingButton, setEditingButton] = useState<HeaderButton | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newButton, setNewButton] = useState<Partial<HeaderButton>>({
    title: '',
    icon: '🔗',
    url: '/',
    visible: true,
    position: 0,
  });
  
  const { toast } = useToast();

  // Buscar botões quando o componente montar
  useEffect(() => {
    fetchButtons();
  }, []);

  // Função para buscar botões do cabeçalho
  const fetchButtons = async () => {
    setIsLoading(true);
    try {
      const data = await getAllHeaderButtons();
      setButtons(data);
    } catch (error) {
      toast({
        title: "Erro ao carregar botões",
        description: "Não foi possível carregar a lista de botões do cabeçalho.",
        variant: "destructive",
      });
      console.error('Erro ao buscar botões:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Abrir diálogo de confirmação para excluir
  const handleDeleteClick = (id: string) => {
    setButtonToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Excluir botão
  const handleDeleteConfirm = async () => {
    if (!buttonToDelete) return;
    
    try {
      await deleteHeaderButton(buttonToDelete);
      
      toast({
        title: "Botão excluído",
        description: "O botão foi excluído com sucesso.",
      });
      
      // Atualizar lista após exclusão
      fetchButtons();
    } catch (error) {
      toast({
        title: "Erro ao excluir botão",
        description: "Não foi possível excluir o botão.",
        variant: "destructive",
      });
      console.error('Erro ao excluir botão:', error);
    } finally {
      setDeleteDialogOpen(false);
      setButtonToDelete(null);
    }
  };

  // Iniciar edição de botão
  const handleEditClick = (button: HeaderButton) => {
    setEditingButton({ ...button });
  };

  // Salvar alterações no botão em edição
  const handleSaveEdit = async () => {
    if (!editingButton) return;
    
    try {
      await updateHeaderButton(editingButton.id, {
        title: editingButton.title,
        icon: editingButton.icon,
        url: editingButton.url,
        visible: editingButton.visible,
        position: editingButton.position,
      });
      
      toast({
        title: "Botão atualizado",
        description: "O botão foi atualizado com sucesso.",
      });
      
      setEditingButton(null);
      fetchButtons();
    } catch (error) {
      toast({
        title: "Erro ao atualizar botão",
        description: "Não foi possível atualizar o botão.",
        variant: "destructive",
      });
      console.error('Erro ao atualizar botão:', error);
    }
  };

  // Cancelar edição
  const handleCancelEdit = () => {
    setEditingButton(null);
  };

  // Criar novo botão
  const handleCreateButton = async () => {
    try {
      // Determinar a próxima posição se não estiver definida
      if (newButton.position === 0) {
        const maxPosition = buttons.length > 0 
          ? Math.max(...buttons.map(b => b.position)) 
          : 0;
        newButton.position = maxPosition + 1;
      }
      
      await addHeaderButton({
        title: newButton.title || 'Novo Botão',
        icon: newButton.icon || '🔗',
        url: newButton.url || '/',
        visible: newButton.visible !== undefined ? newButton.visible : true,
        position: newButton.position || 1,
      });
      
      toast({
        title: "Botão criado",
        description: "O botão foi criado com sucesso.",
      });
      
      setIsCreating(false);
      setNewButton({
        title: '',
        icon: '🔗',
        url: '/',
        visible: true,
        position: 0,
      });
      fetchButtons();
    } catch (error) {
      toast({
        title: "Erro ao criar botão",
        description: "Não foi possível criar o botão.",
        variant: "destructive",
      });
      console.error('Erro ao criar botão:', error);
    }
  };

  // Cancelar criação
  const handleCancelCreate = () => {
    setIsCreating(false);
    setNewButton({
      title: '',
      icon: '🔗',
      url: '/',
      visible: true,
      position: 0,
    });
  };

  // Mover botão para cima ou para baixo na ordem
  const handleMoveButton = async (button: HeaderButton, direction: 'up' | 'down') => {
    const currentIndex = buttons.findIndex(b => b.id === button.id);
    if (
      (direction === 'up' && currentIndex === 0) || 
      (direction === 'down' && currentIndex === buttons.length - 1)
    ) {
      return; // Não pode mover mais
    }
    
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const targetButton = buttons[targetIndex];
    
    try {
      // Trocar posições
      await updateHeaderButton(button.id, { position: targetButton.position });
      await updateHeaderButton(targetButton.id, { position: button.position });
      
      fetchButtons();
    } catch (error) {
      toast({
        title: "Erro ao reordenar botões",
        description: "Não foi possível alterar a ordem dos botões.",
        variant: "destructive",
      });
      console.error('Erro ao reordenar botões:', error);
    }
  };

  // Renderizar formulário de edição
  const renderEditForm = (button: HeaderButton) => (
    <div className="border rounded-md p-4 bg-gray-50 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor={`title-${button.id}`}>Título</Label>
          <Input
            id={`title-${button.id}`}
            value={editingButton?.title || ''}
            onChange={(e) => setEditingButton({ ...editingButton!, title: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor={`icon-${button.id}`}>Ícone (emoji)</Label>
          <Input
            id={`icon-${button.id}`}
            value={editingButton?.icon || ''}
            onChange={(e) => setEditingButton({ ...editingButton!, icon: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor={`url-${button.id}`}>URL</Label>
          <Input
            id={`url-${button.id}`}
            value={editingButton?.url || ''}
            onChange={(e) => setEditingButton({ ...editingButton!, url: e.target.value })}
          />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id={`visible-${button.id}`}
          checked={editingButton?.visible}
          onCheckedChange={(checked) => 
            setEditingButton({ ...editingButton!, visible: checked })
          }
        />
        <Label htmlFor={`visible-${button.id}`}>Visível</Label>
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={handleCancelEdit}>
          <X className="h-4 w-4 mr-1" />
          Cancelar
        </Button>
        <Button size="sm" onClick={handleSaveEdit}>
          <Save className="h-4 w-4 mr-1" />
          Salvar
        </Button>
      </div>
    </div>
  );

  // Renderizar formulário de criação
  const renderCreateForm = () => (
    <div className="border rounded-md p-4 bg-gray-50 space-y-4 mb-6">
      <h3 className="text-lg font-medium">Novo Botão</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="new-title">Título</Label>
          <Input
            id="new-title"
            value={newButton.title}
            onChange={(e) => setNewButton({ ...newButton, title: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="new-icon">Ícone (emoji)</Label>
          <Input
            id="new-icon"
            value={newButton.icon}
            onChange={(e) => setNewButton({ ...newButton, icon: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="new-url">URL</Label>
          <Input
            id="new-url"
            value={newButton.url}
            onChange={(e) => setNewButton({ ...newButton, url: e.target.value })}
          />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="new-visible"
          checked={newButton.visible}
          onCheckedChange={(checked) => 
            setNewButton({ ...newButton, visible: checked })
          }
        />
        <Label htmlFor="new-visible">Visível</Label>
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={handleCancelCreate}>
          <X className="h-4 w-4 mr-1" />
          Cancelar
        </Button>
        <Button size="sm" onClick={handleCreateButton}>
          <Save className="h-4 w-4 mr-1" />
          Criar
        </Button>
      </div>
    </div>
  );

  return (
    <AdminLayout title="Botões do Cabeçalho">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium">Gerenciar Botões do Cabeçalho</h2>
            <p className="text-sm text-gray-500">
              Adicione, edite ou remova botões que aparecem no cabeçalho da página inicial.
            </p>
          </div>
          <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
            <Plus className="h-4 w-4 mr-1" />
            Novo Botão
          </Button>
        </div>

        {isCreating && renderCreateForm()}

        {isLoading ? (
          <div className="text-center py-8">Carregando botões...</div>
        ) : (
          <div className="bg-white rounded-md shadow overflow-hidden">
            {buttons.length > 0 ? (
              <div className="divide-y">
                {buttons.map((button) => (
                  <div key={button.id} className="p-4">
                    {editingButton?.id === button.id ? (
                      renderEditForm(button)
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0 text-2xl">
                            {button.icon}
                          </div>
                          <div>
                            <h3 className="font-medium">{button.title}</h3>
                            <p className="text-sm text-gray-500">{button.url}</p>
                          </div>
                          <div className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100">
                            Posição: {button.position}
                          </div>
                          {button.visible ? (
                            <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Visível
                            </div>
                          ) : (
                            <div className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Oculto
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleMoveButton(button, 'up')}
                            disabled={buttons.indexOf(button) === 0}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleMoveButton(button, 'down')}
                            disabled={buttons.indexOf(button) === buttons.length - 1}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditClick(button)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteClick(button.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500">Nenhum botão encontrado. Clique em "Novo Botão" para adicionar.</p>
              </div>
            )}
          </div>
        )}

        {/* Diálogo de confirmação para exclusão */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. O botão será permanentemente excluído.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteConfirm}
                className="bg-red-500 hover:bg-red-600"
              >
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
