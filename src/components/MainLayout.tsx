'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { SistemaArquivos } from '@/lib/fileSystem';

import { PacientesList } from './PacientesList';
import { SessoesList } from './SessoesList';
import { VisualizationArea } from './VisualizationArea';
import { ToolBar } from './ToolBar';
import { SearchDialog } from './SearchDialog';

export function MainLayout() {
  const { estado, selecionarPastaTrabalho } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Verificar suporte do navegador
  useEffect(() => {
    if (!SistemaArquivos.isSupported) {
      toast.error(
        'Este navegador não suporta acesso ao sistema de arquivos. Use Chrome, Edge ou outro navegador baseado em Chromium.',
        { duration: 10000 }
      );
    }
  }, []);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + F - Buscar
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setSearchOpen(true);
      }

      // Ctrl/Cmd + S - Salvar (será implementado)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        // Implementar salvar
      }

      // Ctrl/Cmd + N - Novo paciente (será implementado)
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        // Implementar novo paciente
      }

      // ESC - Fechar dialogs
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }

      // Tab - Alternar visualizações (será implementado)
      if (e.key === 'Tab' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // Implementar mudança de visualização
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelecionarPasta = async () => {
    setLoading(true);
    try {
      await selecionarPastaTrabalho();
      toast.success('Pasta de trabalho selecionada com sucesso!');
    } catch (error) {
      toast.error('Erro ao selecionar pasta de trabalho');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Se não tem pasta de trabalho, mostrar tela de setup
  if (!estado.configuracao.pastaTrabalho) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded"></div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Mapas de Processos Psicológicos
              </h1>
              <p className="text-gray-600">
                Selecione uma pasta em seu computador para armazenar os dados dos pacientes de forma segura e local.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-amber-400 rounded-full flex-shrink-0 mt-0.5"></div>
                  <div>
                    <h3 className="font-medium text-amber-800 mb-1">Armazenamento Local</h3>
                    <p className="text-sm text-amber-700">
                      Todos os dados ficam em seu computador. Nenhuma informação é enviada para a nuvem.
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleSelecionarPasta}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? 'Selecionando...' : 'Selecionar Pasta de Trabalho'}
              </Button>

              <div className="text-xs text-gray-500 space-y-1">
                <p>A estrutura de pastas será criada automaticamente:</p>
                <p className="font-mono bg-gray-50 px-2 py-1 rounded">
                  Processos Clinicos/Pacientes/[Nome]/Sessões
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden border-r bg-white shadow-sm`}>
        <div className="h-full flex flex-col">
          {/* Header da Sidebar */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900">Pacientes</h2>
              <Badge variant="outline" className="text-xs">
                {estado.configuracao.pastaTrabalho}
              </Badge>
            </div>
            <Input
              placeholder="Buscar pacientes..."
              className="text-sm"
            />
          </div>

          {/* Lista de Pacientes */}
          <div className="flex-1 overflow-hidden">
            <PacientesList />
          </div>

          {/* Lista de Sessões */}
          {estado.pacienteAtual && (
            <>
              <Separator />
              <div className="h-48 border-t bg-gray-50">
                <div className="p-3 border-b">
                  <h3 className="font-medium text-sm text-gray-700">
                    Sessões - {estado.pacienteAtual.nome}
                  </h3>
                </div>
                <ScrollArea className="h-40">
                  <SessoesList />
                </ScrollArea>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Área Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Principal */}
        <div className="h-16 bg-white border-b flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <div className={`w-4 h-0.5 bg-gray-600 transition-all duration-200 ${sidebarOpen ? 'rotate-45' : ''}`}></div>
              <div className={`w-4 h-0.5 bg-gray-600 my-1 transition-all duration-200 ${sidebarOpen ? 'opacity-0' : ''}`}></div>
              <div className={`w-4 h-0.5 bg-gray-600 transition-all duration-200 ${sidebarOpen ? '-rotate-45 -mt-1.5' : ''}`}></div>
            </Button>

            {/* Breadcrumbs */}
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Processos Clínicos</span>
              {estado.pacienteAtual && (
                <>
                  <span>/</span>
                  <span className="font-medium text-gray-900">
                    {estado.pacienteAtual.nome}
                  </span>
                </>
              )}
              {estado.sessaoAtual && (
                <>
                  <span>/</span>
                  <span className="font-medium text-blue-600">
                    {new Date(estado.sessaoAtual.data).toLocaleDateString('pt-BR')}
                  </span>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchOpen(true)}
            >
              Buscar (Ctrl+F)
            </Button>
            
            {estado.sessaoAtual && estado.sessaoAtual.updatedAt > estado.sessaoAtual.createdAt && (
              <Badge variant="secondary" className="text-xs">
                Alterações pendentes
              </Badge>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <ToolBar />

        {/* Área de Visualização */}
        <div className="flex-1 overflow-hidden">
          <VisualizationArea />
        </div>
      </div>

      {/* Dialogs */}
      <SearchDialog 
        open={searchOpen} 
        onOpenChange={setSearchOpen} 
      />
    </div>
  );
}