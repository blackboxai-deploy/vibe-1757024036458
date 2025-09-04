'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { Paciente, Sessao, EstadoApp, TipoVisualizacao, FiltroProcessos, ConfiguracaoApp } from '@/types';
import { sistemaArquivos } from '@/lib/fileSystem';

// Actions para o reducer
type AppAction = 
  | { type: 'SET_PACIENTE_ATUAL'; payload: Paciente | undefined }
  | { type: 'SET_SESSAO_ATUAL'; payload: Sessao | undefined }
  | { type: 'SET_VISUALIZACAO'; payload: TipoVisualizacao }
  | { type: 'SET_FILTROS'; payload: Partial<FiltroProcessos> }
  | { type: 'SET_CONFIGURACAO'; payload: Partial<ConfiguracaoApp> }
  | { type: 'SET_PASTA_TRABALHO'; payload: string }
  | { type: 'ADD_PROCESSO'; payload: any }
  | { type: 'UPDATE_PROCESSO'; payload: any }
  | { type: 'DELETE_PROCESSO'; payload: string }
  | { type: 'ADD_CONEXAO'; payload: any }
  | { type: 'DELETE_CONEXAO'; payload: string }
  | { type: 'SAVE_DATA' }
  | { type: 'LOAD_DATA' };

// Estado inicial
const estadoInicial: EstadoApp = {
  pacienteAtual: undefined,
  sessaoAtual: undefined,
  visualizacaoAtiva: 'rede',
  filtros: {
    dimensoes: [],
    sessoes: [],
    dataInicio: undefined,
    dataFim: undefined,
    texto: ''
  },
  configuracao: {
    pastaTrabalho: '',
    autoSave: true,
    intervaloAutoSave: 30,
    temaEscuro: false,
    showGrid: true,
    snapToGrid: false
  },
  historico: []
};

// Reducer
function appReducer(estado: EstadoApp, action: AppAction): EstadoApp {
  switch (action.type) {
    case 'SET_PACIENTE_ATUAL':
      return { 
        ...estado, 
        pacienteAtual: action.payload,
        sessaoAtual: action.payload?.sessoes?.[0] || undefined
      };

    case 'SET_SESSAO_ATUAL':
      return { ...estado, sessaoAtual: action.payload };

    case 'SET_VISUALIZACAO':
      return { ...estado, visualizacaoAtiva: action.payload };

    case 'SET_FILTROS':
      return { 
        ...estado, 
        filtros: { ...estado.filtros, ...action.payload }
      };

    case 'SET_CONFIGURACAO':
      return {
        ...estado,
        configuracao: { ...estado.configuracao, ...action.payload }
      };

    case 'SET_PASTA_TRABALHO':
      return {
        ...estado,
        configuracao: { 
          ...estado.configuracao, 
          pastaTrabalho: action.payload 
        }
      };

    case 'ADD_PROCESSO':
      if (!estado.sessaoAtual) return estado;
      return {
        ...estado,
        sessaoAtual: {
          ...estado.sessaoAtual,
          processos: [...estado.sessaoAtual.processos, action.payload],
          updatedAt: new Date()
        }
      };

    case 'UPDATE_PROCESSO':
      if (!estado.sessaoAtual) return estado;
      return {
        ...estado,
        sessaoAtual: {
          ...estado.sessaoAtual,
          processos: estado.sessaoAtual.processos.map(p => 
            p.id === action.payload.id ? { ...p, ...action.payload } : p
          ),
          updatedAt: new Date()
        }
      };

    case 'DELETE_PROCESSO':
      if (!estado.sessaoAtual) return estado;
      return {
        ...estado,
        sessaoAtual: {
          ...estado.sessaoAtual,
          processos: estado.sessaoAtual.processos.filter(p => p.id !== action.payload),
          conexoes: estado.sessaoAtual.conexoes.filter(c => 
            c.origem !== action.payload && c.destino !== action.payload
          ),
          updatedAt: new Date()
        }
      };

    case 'ADD_CONEXAO':
      if (!estado.sessaoAtual) return estado;
      return {
        ...estado,
        sessaoAtual: {
          ...estado.sessaoAtual,
          conexoes: [...estado.sessaoAtual.conexoes, action.payload],
          updatedAt: new Date()
        }
      };

    case 'DELETE_CONEXAO':
      if (!estado.sessaoAtual) return estado;
      return {
        ...estado,
        sessaoAtual: {
          ...estado.sessaoAtual,
          conexoes: estado.sessaoAtual.conexoes.filter(c => c.id !== action.payload),
          updatedAt: new Date()
        }
      };

    default:
      return estado;
  }
}

// Contexto
interface AppContextType {
  estado: EstadoApp;
  dispatch: React.Dispatch<AppAction>;
  // Ações específicas
  selecionarPaciente: (paciente: Paciente | undefined) => void;
  selecionarSessao: (sessao: Sessao | undefined) => void;
  alterarVisualizacao: (tipo: TipoVisualizacao) => void;
  atualizarFiltros: (filtros: Partial<FiltroProcessos>) => void;
  selecionarPastaTrabalho: () => Promise<void>;
  salvarDados: () => Promise<void>;
  carregarPacientes: () => Promise<string[]>;
  criarNovaSessao: (pacienteId: string) => Promise<Sessao>;
  // Estados derivados
  podeEditar: boolean;
  temAlteracoesPendentes: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

// Provider
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [estado, dispatch] = useReducer(appReducer, estadoInicial);

  // Auto-save
  useEffect(() => {
    if (!estado.configuracao.autoSave) return;

    const intervalId = setInterval(async () => {
      if (estado.sessaoAtual && estado.pacienteAtual) {
        try {
          await sistemaArquivos.salvarSessao(estado.pacienteAtual.nome, estado.sessaoAtual);
          await sistemaArquivos.salvarPaciente(estado.pacienteAtual);
        } catch (error) {
          console.error('Erro no auto-save:', error);
        }
      }
    }, estado.configuracao.intervaloAutoSave * 1000);

    return () => clearInterval(intervalId);
  }, [estado.configuracao.autoSave, estado.configuracao.intervaloAutoSave, estado.sessaoAtual, estado.pacienteAtual]);

  // Ações específicas
  const selecionarPaciente = useCallback((paciente: Paciente | undefined) => {
    dispatch({ type: 'SET_PACIENTE_ATUAL', payload: paciente });
  }, []);

  const selecionarSessao = useCallback((sessao: Sessao | undefined) => {
    dispatch({ type: 'SET_SESSAO_ATUAL', payload: sessao });
  }, []);

  const alterarVisualizacao = useCallback((tipo: TipoVisualizacao) => {
    dispatch({ type: 'SET_VISUALIZACAO', payload: tipo });
  }, []);

  const atualizarFiltros = useCallback((filtros: Partial<FiltroProcessos>) => {
    dispatch({ type: 'SET_FILTROS', payload: filtros });
  }, []);

  const selecionarPastaTrabalho = useCallback(async () => {
    try {
      const nomePasta = await sistemaArquivos.selecionarPastaTrabalho();
      dispatch({ type: 'SET_PASTA_TRABALHO', payload: nomePasta });
    } catch (error) {
      console.error('Erro ao selecionar pasta de trabalho:', error);
      throw error;
    }
  }, []);

  const salvarDados = useCallback(async () => {
    if (!estado.pacienteAtual || !estado.sessaoAtual) return;

    try {
      await sistemaArquivos.salvarSessao(estado.pacienteAtual.nome, estado.sessaoAtual);
      await sistemaArquivos.salvarPaciente(estado.pacienteAtual);
      console.log('Dados salvos com sucesso');
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      throw error;
    }
  }, [estado.pacienteAtual, estado.sessaoAtual]);

  const carregarPacientes = useCallback(async () => {
    try {
      return await sistemaArquivos.listarPacientes();
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
      return [];
    }
  }, []);

  const criarNovaSessao = useCallback(async (pacienteId: string): Promise<Sessao> => {
    const novaSessao: Sessao = {
      id: `sessao_${Date.now()}`,
      data: new Date(),
      pacienteId,
      processos: [],
      conexoes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (estado.pacienteAtual) {
      await sistemaArquivos.salvarSessao(estado.pacienteAtual.nome, novaSessao);
    }

    return novaSessao;
  }, [estado.pacienteAtual]);

  // Estados derivados
  const podeEditar = Boolean(estado.pacienteAtual && estado.sessaoAtual);
  const temAlteracoesPendentes = Boolean(
    estado.sessaoAtual && 
    estado.sessaoAtual.updatedAt > estado.sessaoAtual.createdAt
  );

  const contextValue: AppContextType = {
    estado,
    dispatch,
    selecionarPaciente,
    selecionarSessao,
    alterarVisualizacao,
    atualizarFiltros,
    selecionarPastaTrabalho,
    salvarDados,
    carregarPacientes,
    criarNovaSessao,
    podeEditar,
    temAlteracoesPendentes
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Hook customizado
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de AppProvider');
  }
  return context;
}