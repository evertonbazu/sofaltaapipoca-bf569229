
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { 
  getAllButtons, 
  updateButton, 
  createButton, 
  deleteButton,
  toggleButtonVisibility
} from '@/services/button-service';

interface HeaderButton {
  id: string;
  title: string;
  icon: string;
  url: string;
  visible: boolean;
  position: number;
}

const ButtonsManager = () => {
  const [buttons, setButtons] = useState<HeaderButton[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentButton, setCurrentButton] = useState<HeaderButton | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  // Buscar os botões quando o componente montar
  useEffect(() => {
    fetchButtons();
  }, []);

  // Função para buscar os botões
  const fetchButtons = async () => {
    setIsLoading(true);
    try {
      const data = await getAllButtons();
      setButtons(data);
    } catch (error) {
      console.error('Erro ao buscar botões:', error);
      toast({
        title: "Erro ao carregar botões",
        description: "Não foi possível carregar a lista de botões.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para adicionar um novo botão
  const handleAddButton = () => {
    setCurrentButton({
      id: '',
      title: '',
      icon: '',
      url: '',
      visible: true,
      position: buttons.length + 1
    });
    setIsEditDialogOpen(true);
  };

  // Função para editar um botão existente
  const handleEditButton = (button: HeaderButton) => {
    setCurrentButton(button);
    setIsEditDialogOpen(true);
  };

  // Função para salvar as alterações de um botão
  const handleSaveButton = async () => {
    if (!currentButton) return;

    try {
      if (currentButton.id) {
        // Atualizar botão existente
        await updateButton(currentButton.id, currentButton);
        toast({
          title: "Botão atualizado",
          description: `O botão "${currentButton.title}" foi atualizado com sucesso.`
        });
      } else {
        // Criar novo botão
        await createButton(currentButton);
        toast({
          title: "Botão criado",
          description: `O botão "${currentButton.title}" foi criado com sucesso.`
        });
      }

      // Recarregar a lista de botões
      fetchButtons();
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Erro ao salvar botão:', error);
      toast({
        title: "Erro ao salvar botão",
        description: "Ocorreu um erro ao salvar as alterações do botão.",
        variant: "destructive",
      });
    }
  };

  // Função para excluir um botão
  const handleDeleteButton = async (id: string, title: string) => {
    if (!id) return;

    if (!confirm(`Tem certeza que deseja excluir o botão "${title}"?`)) {
      return;
    }

    try {
      await deleteButton(id);
      toast({
        title: "Botão excluído",
        description: `O botão "${title}" foi excluído com sucesso.`
      });

      // Recarregar a lista de botões
      fetchButtons();
    } catch (error) {
      console.error('Erro ao excluir botão:', error);
      toast({
        title: "Erro ao excluir botão",
        description: "Ocorreu um erro ao excluir o botão.",
        variant: "destructive",
      });
    }
  };

  // Função para alternar a visibilidade de um botão
  const handleToggleVisibility = async (id: string, visible: boolean, title: string) => {
    try {
      await toggleButtonVisibility(id, !visible);
      toast({
        title: visible ? "Botão ocultado" : "Botão exibido",
        description: `O botão "${title}" foi ${visible ? "ocultado" : "exibido"} com sucesso.`
      });

      // Recarregar a lista de botões
      fetchButtons();
    } catch (error) {
      console.error('Erro ao alterar visibilidade do botão:', error);
      toast({
        title: "Erro ao alterar visibilidade",
        description: "Ocorreu um erro ao alterar a visibilidade do botão.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Botões da Tela Inicial</span>
          <Button onClick={handleAddButton} size="sm">
            <Plus className="mr-1 h-4 w-4" /> Adicionar Botão
          </Button>
        </CardTitle>
        <CardDescription>
          Gerencie os botões que aparecem na tela inicial do site.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-6">Carregando botões...</div>
        ) : buttons.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Ícone</TableHead>
                  <TableHead>Visível</TableHead>
                  <TableHead>Posição</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {buttons.map((button) => (
                  <TableRow key={button.id}>
                    <TableCell className="font-medium">{button.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 max-w-[200px] truncate">
                        <span className="truncate">{button.url}</span>
                        <a href={button.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>{button.icon}</TableCell>
                    <TableCell>
                      <Switch
                        checked={button.visible}
                        onCheckedChange={() => handleToggleVisibility(button.id, button.visible, button.title)}
                      />
                    </TableCell>
                    <TableCell>{button.position}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditButton(button)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteButton(button.id, button.title)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
          <div className="text-center py-6">
            <p className="text-gray-500">Nenhum botão cadastrado.</p>
            <p className="text-sm text-gray-400 mt-1">Adicione botões para exibir na tela inicial.</p>
          </div>
        )}
      </CardContent>

      {/* Diálogo para adicionar/editar botão */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentButton?.id ? 'Editar Botão' : 'Adicionar Botão'}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações do botão abaixo.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Título
              </Label>
              <Input
                id="title"
                value={currentButton?.title || ''}
                onChange={(e) => setCurrentButton(prev => prev ? {...prev, title: e.target.value} : null)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">
                URL
              </Label>
              <Input
                id="url"
                value={currentButton?.url || ''}
                onChange={(e) => setCurrentButton(prev => prev ? {...prev, url: e.target.value} : null)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="icon" className="text-right">
                Ícone
              </Label>
              <Input
                id="icon"
                value={currentButton?.icon || ''}
                onChange={(e) => setCurrentButton(prev => prev ? {...prev, icon: e.target.value} : null)}
                className="col-span-3"
                placeholder="📱, 💬, 👤 (emoji ou ícone)"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="position" className="text-right">
                Posição
              </Label>
              <Input
                id="position"
                type="number"
                value={currentButton?.position || 1}
                onChange={(e) => setCurrentButton(prev => prev ? {...prev, position: parseInt(e.target.value) || 1} : null)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="visible" className="text-right">
                Visível
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="visible"
                  checked={currentButton?.visible || false}
                  onCheckedChange={(checked) => setCurrentButton(prev => prev ? {...prev, visible: checked} : null)}
                />
                <Label htmlFor="visible">
                  {currentButton?.visible ? 'Sim' : 'Não'}
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveButton}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ButtonsManager;
