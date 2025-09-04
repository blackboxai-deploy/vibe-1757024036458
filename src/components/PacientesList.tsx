'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Paciente } from '@/types';
import { sistemaArquivos } from '@/lib/fileSystem';

export function PacientesList() {
  const { estado, selecionarPaciente, carregarPacientes } = useApp();
  const [pacientes, setPacientes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Carregar lista de pacientes
  useEffect(() => {
    async function loadPacientes() {
      setLoading(true);
      try {
        const listaPacientes = await carregarPacientes();
        setPacientes(listaPacientes);
      } catch (error) {
        console.error('Erro ao carregar pacientes:', error);
        toast.error('Erro ao carregar lista de pacientes');
      } finally {
        setLoading(false);
      }
    }

    if (estado.configuracao.pastaTrabalho) {
      loadPacientes();
    }
  }, [estado.configuracao.pastaTrabalho, carregarPacientes]);

  const handleSelecionarPaciente = async (nomePaciente: string) => {
    try {
      const paciente = await sistemaArquivos.carregarPaciente(nomePaciente);
      if (paciente) {
        // Carregar sessões do paciente
        const sessoes = await sistemaArquivos.carregarSessoes(nomePaciente);
        paciente.sessoes = sessoes;
        selecionarPaciente(paciente || undefined);
        toast.success(`Paciente ${paciente.nome} selecionado`);
      } else {
        toast.error('Erro ao carregar dados do paciente');
      }
    } catch (error) {
      console.error('Erro ao selecionar paciente:', error);
      toast.error('Erro ao selecionar paciente');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            {pacientes.length} paciente{pacientes.length !== 1 ? 's' : ''}
          </span>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                Novo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Paciente</DialogTitle>
              </DialogHeader>
              <FormularioPaciente 
                onSuccess={() => {
                  setDialogOpen(false);
                  // Recarregar lista
                  carregarPacientes().then(setPacientes);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Carregando pacientes...
            </div>
          ) : pacientes.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Nenhum paciente encontrado
            </div>
          ) : (
            pacientes.map((nomePaciente) => (
              <Card
                key={nomePaciente}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  estado.pacienteAtual?.nome === nomePaciente 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleSelecionarPaciente(nomePaciente)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-sm text-gray-900">
                        {nomePaciente}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Clique para visualizar
                      </p>
                    </div>
                    {estado.pacienteAtual?.nome === nomePaciente && (
                      <Badge variant="secondary" className="text-xs">
                        Ativo
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// Componente do formulário de novo paciente
function FormularioPaciente({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    nome: '',
    sexo: '' as 'M' | 'F' | 'Outro' | '',
    idade: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim() || !formData.sexo || !formData.idade) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const novoPaciente: Paciente = {
        id: `paciente_${Date.now()}`,
        nome: formData.nome.trim(),
        sexo: formData.sexo as 'M' | 'F' | 'Outro',
        idade: parseInt(formData.idade),
        datacriacao: new Date(),
        sessoes: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await sistemaArquivos.salvarPaciente(novoPaciente);
      toast.success(`Paciente ${novoPaciente.nome} criado com sucesso!`);
      onSuccess();
      
      // Limpar formulário
      setFormData({ nome: '', sexo: '', idade: '' });
    } catch (error) {
      console.error('Erro ao criar paciente:', error);
      toast.error('Erro ao criar paciente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="nome">Nome completo *</Label>
        <Input
          id="nome"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          placeholder="Digite o nome do paciente"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="sexo">Sexo *</Label>
        <Select 
          value={formData.sexo} 
          onValueChange={(value) => setFormData({ ...formData, sexo: value as 'M' | 'F' | 'Outro' })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Selecione o sexo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="M">Masculino</SelectItem>
            <SelectItem value="F">Feminino</SelectItem>
            <SelectItem value="Outro">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="idade">Idade *</Label>
        <Input
          id="idade"
          type="number"
          min="0"
          max="120"
          value={formData.idade}
          onChange={(e) => setFormData({ ...formData, idade: e.target.value })}
          placeholder="Digite a idade"
          className="mt-1"
        />
      </div>

      <Separator />

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={() => onSuccess()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Criando...' : 'Criar Paciente'}
        </Button>
      </div>
    </form>
  );
}