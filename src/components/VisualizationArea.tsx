'use client';

import { useApp } from '@/contexts/AppContext';
import { Card } from '@/components/ui/card';

export function VisualizationArea() {
  const { estado } = useApp();

  if (!estado.pacienteAtual) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-gray-300 rounded"></div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Selecione um Paciente
          </h3>
          <p className="text-gray-600 text-sm">
            Escolha um paciente na lista lateral para começar a visualizar e editar os mapas de processos psicológicos.
          </p>
        </Card>
      </div>
    );
  }

  if (!estado.sessaoAtual) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-blue-400 rounded"></div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Criar Nova Sessão
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Para começar a trabalhar com <strong>{estado.pacienteAtual.nome}</strong>, 
            crie uma nova sessão ou selecione uma sessão existente.
          </p>
          <div className="bg-gray-50 rounded p-3 text-xs text-gray-500">
            💡 Use o botão "Nova Sessão" na lista de sessões para começar
          </div>
        </Card>
      </div>
    );
  }

  // Área principal de visualização baseada no tipo ativo
  return (
    <div className="h-full bg-white relative">
      {estado.visualizacaoAtiva === 'rede' && <VisualizacaoRede />}
      {estado.visualizacaoAtiva === 'matriz' && <VisualizacaoMatriz />}
      {estado.visualizacaoAtiva === 'combinada' && <VisualizacaoCombinada />}
      {estado.visualizacaoAtiva === 'microprocessos' && <VisualizacaoMicroprocessos />}
    </div>
  );
}

function VisualizacaoRede() {
  return (
    <div className="h-full flex items-center justify-center bg-gray-50">
      <Card className="p-6 text-center">
        <h4 className="font-medium text-gray-900 mb-2">Visualização em Rede</h4>
        <p className="text-sm text-gray-600 mb-4">
          Flowchart interativo com processos e conexões
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-xs text-yellow-700">
          🚧 Em desenvolvimento - Canvas interativo com React Flow
        </div>
      </Card>
    </div>
  );
}

function VisualizacaoMatriz() {
  return (
    <div className="h-full flex items-center justify-center bg-gray-50">
      <Card className="p-6 text-center">
        <h4 className="font-medium text-gray-900 mb-2">Matriz 3x3</h4>
        <p className="text-sm text-gray-600 mb-4">
          Organização por dimensões psicológicas e níveis contextuais
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-xs text-yellow-700">
          🚧 Em desenvolvimento - Grade 3x3 com drag & drop
        </div>
      </Card>
    </div>
  );
}

function VisualizacaoCombinada() {
  return (
    <div className="h-full flex items-center justify-center bg-gray-50">
      <Card className="p-6 text-center">
        <h4 className="font-medium text-gray-900 mb-2">Visualização Combinada</h4>
        <p className="text-sm text-gray-600 mb-4">
          Matriz com rede sobreposta
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-xs text-yellow-700">
          🚧 Em desenvolvimento - Visualização híbrida
        </div>
      </Card>
    </div>
  );
}

function VisualizacaoMicroprocessos() {
  return (
    <div className="h-full flex items-center justify-center bg-gray-50">
      <Card className="p-6 text-center">
        <h4 className="font-medium text-gray-900 mb-2">Microprocessos da Sessão</h4>
        <p className="text-sm text-gray-600 mb-4">
          Visualização isolada dos processos da sessão atual
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-xs text-yellow-700">
          🚧 Em desenvolvimento - Vista individual da sessão
        </div>
      </Card>
    </div>
  );
}