
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { HeaderButton } from '@/types/subscriptionTypes';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const HeaderButtons: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [buttons, setButtons] = useState<HeaderButton[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentButton, setCurrentButton] = useState<HeaderButton | null>(null);
  
  // Estados para o formulário
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState("");
  const [visible, setVisible] = useState(true);
  const [position, setPosition] = useState(0);

  // Carregar botões
  useEffect(() => {
    fetchButtons();
  }, []);

  const fetchButtons = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('header_buttons')
        .select('*')
        .order('position', { ascending: true });

      if (error) throw error;
      setButtons(data || []);
    } catch (error) {
      console.error('Erro ao buscar botões:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os botões do cabeçalho.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Abrir diálogo para edição ou criação
  const handleOpenDialog = (button?: HeaderButton) => {
    if (button) {
      setCurrentButton(button);
      setTitle(button.title);
      setUrl(button.url);
      setIcon(button.icon);
      setVisible(button.visible);
      setPosition(button.position);
    } else {
      setCurrentButton(null);
      setTitle("");
      setUrl("");
      setIcon("");
      setVisible(true);
      setPosition(buttons.length > 0 ? Math.max(...buttons.map(b => b.position)) + 1 : 1);
    }
    setIsDialogOpen(true);
  };

  // Salvar botão (criar ou atualizar)
  const handleSaveButton = async () => {
    try {
      // Validações básicas
      if (!title.trim() || !url.trim() || !icon.trim()) {
        toast({
          title: "Erro",
          description: "Todos os campos são obrigatórios.",
          variant: "destructive",
        });
        return;
      }

      const buttonData = {
        title,
        url,
        icon,
        visible,
        position
      };

      let result;
      
      if (currentButton) {
        // Atualizar botão existente
        result = await supabase
          .from('header_buttons')
          .update(buttonData)
          .eq('id', currentButton.id);
      } else {
        // Criar novo botão
        result = await supabase
          .from('header_buttons')
          .insert([buttonData]);
      }

      if (result.error) throw result.error;

      toast({
        title: currentButton ? "Botão atualizado" : "Botão criado",
        description: currentButton ? 
          "O botão foi atualizado com sucesso." : 
          "O botão foi adicionado com sucesso.",
      });

      setIsDialogOpen(false);
      fetchButtons();
    } catch (error) {
      console.error('Erro ao salvar botão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o botão.",
        variant: "destructive",
      });
    }
  };

  // Alternar visibilidade do botão
  const toggleButtonVisibility = async (button: HeaderButton) => {
    try {
      const { error } = await supabase
        .from('header_buttons')
        .update({ visible: !button.visible })
        .eq('id', button.id);

      if (error) throw error;

      toast({
        title: button.visible ? "Botão ocultado" : "Botão exibido",
        description: button.visible ? 
          "O botão foi ocultado na página inicial." : 
          "O botão será exibido na página inicial.",
      });

      fetchButtons();
    } catch (error) {
      console.error('Erro ao atualizar visibilidade:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a visibilidade do botão.",
        variant: "destructive",
      });
    }
  };

  // Excluir botão
  const handleDeleteButton = async (button: HeaderButton) => {
    if (!confirm(`Tem certeza que deseja excluir o botão "${button.title}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('header_buttons')
        .delete()
        .eq('id', button.id);

      if (error) throw error;

      toast({
        title: "Botão excluído",
        description: "O botão foi removido com sucesso.",
      });

      fetchButtons();
    } catch (error) {
      console.error('Erro ao excluir botão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o botão.",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout title="Botões do Cabeçalho">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium">Gerenciar Botões do Cabeçalho</h2>
          <p className="text-sm text-gray-500">
            Adicione, edite ou remova os botões que aparecem na página inicial.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Novo Botão
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="bg-white rounded-md shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">Posição</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Ícone</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Visível</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {buttons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                    Nenhum botão encontrado. Clique em "Novo Botão" para adicionar.
                  </TableCell>
                </TableRow>
              ) : (
                buttons.map((button) => (
                  <TableRow key={button.id}>
                    <TableCell>{button.position}</TableCell>
                    <TableCell>{button.title}</TableCell>
                    <TableCell>{button.icon}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      <a href={button.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {button.url}
                      </a>
                    </TableCell>
                    <TableCell>
                      {button.visible ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Eye className="h-3 w-3 mr-1" />
                          Sim
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Não
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => toggleButtonVisibility(button)}
                        title={button.visible ? "Ocultar botão" : "Exibir botão"}
                      >
                        {button.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleOpenDialog(button)}
                        title="Editar botão"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteButton(button)}
                        title="Excluir botão"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Diálogo para criar/editar botão */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentButton ? "Editar Botão" : "Novo Botão"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Título
              </Label>
              <Input
                id="title"
                className="col-span-3"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Fale Conosco"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">
                URL
              </Label>
              <Input
                id="url"
                className="col-span-3"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Ex: https://wa.me/123456789"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="icon" className="text-right">
                Ícone
              </Label>
              <Input
                id="icon"
                className="col-span-3"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="Ex: MessageSquare"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="position" className="text-right">
                Posição
              </Label>
              <Input
                id="position"
                type="number"
                className="col-span-3"
                value={position}
                onChange={(e) => setPosition(parseInt(e.target.value))}
                min={1}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="visible" className="text-right">
                Visível
              </Label>
              <div className="flex items-center col-span-3 space-x-2">
                <Switch
                  id="visible"
                  checked={visible}
                  onCheckedChange={setVisible}
                />
                <Label htmlFor="visible">
                  {visible ? "Sim" : "Não"}
                </Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveButton}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default HeaderButtons;
