'use client';

import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Sessao } from '@/types';
import { sistemaArquivos } from '@/lib/fileSystem';

export function SessoesList() {
  const { estado, selecionarSessao, criarNovaSessao } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSelecionarSessao = (sessao: Sessao) => {
    selecionarSessao(sessao);
    toast.success(`Sessão de ${new Date(sessao.data).toLocaleDateString('pt-BR')} selecionada`);
  };

  const handleNovaSessao = async (observacoes?: string) => {
    if (!estado.pacienteAtual) return;

    setLoading(true);
    try {
      const novaSessao = await criarNovaSessao(estado.pacienteAtual.id);
      if (observacoes) {
        novaSessao.observacoes = observacoes;
      }
      
      await sistemaArquivos.salvarSessao(estado.pacienteAtual.nome, novaSessao);
      
      // Atualizar paciente com nova sessão
      const pacienteAtualizado = {
        ...estado.pacienteAtual,
        sessoes: [novaSessao, ...estado.pacienteAtual.sessoes],
        updatedAt: new Date()
      };
      
      await sistemaArquivos.salvarPaciente(pacienteAtualizado);
      
      selecionarSessao(novaSessao);
      toast.success('Nova sessão criada com sucesso!');
      setDialogOpen(false);
    } catch (error) {
      console.error('Erro ao criar nova sessão:', error);
      toast.error('Erro ao criar nova sessão');
    } finally {
      setLoading(false);
    }
  };

  if (!estado.pacienteAtual) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        Selecione um paciente para ver as sessões
      </div>
    );
  }

  const sessoes = estado.pacienteAtual.sessoes || [];

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-600">
          {sessoes.length} sessã{sessoes.length !== 1 ? 'es' : 'o'}
        </span>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="text-xs h-7">
              Nova Sessão
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Sessão</DialogTitle>
            </DialogHeader>
            <FormularioSessao 
              onSuccess={handleNovaSessao}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 overflow-auto px-2 pb-2">
        <div className="space-y-1">
          {sessoes.length === 0 ? (
            <div className="p-3 text-center text-xs text-gray-500">
              Nenhuma sessão encontrada
            </div>
          ) : (
            sessoes.map((sessao) => (
              <Card
                key={sessao.id}
                className={`cursor-pointer transition-all hover:shadow-sm ${
                  estado.sessaoAtual?.id === sessao.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleSelecionarSessao(sessao)}
              >
                <CardContent className="p-2">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-900">
                        {new Date(sessao.data).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs h-4">
                          {sessao.processos?.length || 0} processos
                        </Badge>
                        {sessao.conexoes?.length > 0 && (
                          <Badge variant="outline" className="text-xs h-4">
                            {sessao.conexoes.length} conexões
                          </Badge>
                        )}
                      </div>
                    </div>
                    {estado.sessaoAtual?.id === sessao.id && (
                      <Badge variant="secondary" className="text-xs ml-2">
                        Ativa
                      </Badge>
                    )}
                  </div>
                  {sessao.observacoes && (
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      {sessao.observacoes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Componente do formulário de nova sessão
function FormularioSessao({ 
  onSuccess, 
  loading 
}: { 
  onSuccess: (observacoes?: string) => void;
  loading: boolean;
}) {
  const [observacoes, setObservacoes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess(observacoes.trim() || undefined);
    setObservacoes('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="data">Data da sessão</Label>
        <div className="mt-1 p-2 bg-gray-50 rounded-md text-sm text-gray-700">
          {new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>

      <div>
        <Label htmlFor="observacoes">Observações iniciais (opcional)</Label>
        <Textarea
          id="observacoes"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Digite observações sobre esta sessão..."
          className="mt-1"
          rows={3}
        />
      </div>

      <Separator />

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={() => setObservacoes('')}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Criando...' : 'Criar Sessão'}
        </Button>
      </div>
    </form>
  );
}