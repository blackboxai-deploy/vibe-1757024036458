// Tipos principais para o app de mapas de processos psicológicos

export interface Paciente {
  id: string;
  nome: string;
  datacriacao: Date;
  sexo: 'M' | 'F' | 'Outro';
  idade: number;
  sessoes: Sessao[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Sessao {
  id: string;
  data: Date;
  pacienteId: string;
  processos: Processo[];
  conexoes: Conexao[];
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Processo {
  id: string;
  texto: string;
  dimensao: DimensaoProcesso;
  posicao: Posicao;
  cor: string;
  dataCriacao: Date;
  sessaoId: string;
  tamanho?: { width: number; height: number };
}

export interface Conexao {
  id: string;
  origem: string; // ID do processo
  destino: string; // ID do processo
  tipo: TipoConexao;
  sessaoId: string;
  label?: string;
  cor?: string;
}

export interface MatrizPosicao {
  quadrante: QuadranteMatriz;
  processos: string[]; // IDs dos processos
  label: string;
  cor: string;
}

export interface Posicao {
  x: number;
  y: number;
}

// Enums e tipos específicos
export type DimensaoProcesso = 
  | 'afeto' 
  | 'cognição' 
  | 'atenção' 
  | 'motivação' 
  | 'self' 
  | 'biofisiologico' 
  | 'contexto' 
  | 'sociocultural';

export type TipoConexao = 
  | 'causal' 
  | 'correlacional' 
  | 'temporal' 
  | 'bidirectional';

export type QuadranteMatriz = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type TipoVisualizacao = 
  | 'rede' 
  | 'matriz' 
  | 'combinada' 
  | 'microprocessos';

// Configurações de cores para as dimensões
export const CORES_DIMENSOES: Record<DimensaoProcesso, string> = {
  // Dimensões Psicológicas
  'afeto': '#FF6B6B',          // Vermelho suave
  'cognição': '#4ECDC4',       // Verde-água
  'atenção': '#45B7D1',        // Azul
  'motivação': '#F7DC6F',      // Amarelo
  'self': '#BB8FCE',           // Roxo suave
  
  // Níveis Contextuais
  'biofisiologico': '#52C41A',  // Verde
  'contexto': '#FA8C16',        // Laranja
  'sociocultural': '#722ED1'    // Roxo escuro
};

// Configuração da Matriz 3x3
export const MATRIZ_CONFIG: Record<QuadranteMatriz, { label: string; dimensoes: DimensaoProcesso[] }> = {
  1: { label: 'Atenção', dimensoes: ['atenção'] },
  2: { label: 'Cognição', dimensoes: ['cognição'] },
  3: { label: 'Self', dimensoes: ['self'] },
  4: { label: 'Afeto', dimensoes: ['afeto'] },
  5: { label: 'Self Central', dimensoes: ['self'] },
  6: { label: 'Motivação', dimensoes: ['motivação'] },
  7: { label: 'Biofisiológico', dimensoes: ['biofisiologico'] },
  8: { label: 'Contexto', dimensoes: ['contexto'] },
  9: { label: 'Sociocultural', dimensoes: ['sociocultural'] }
};

// Interface para filtros
export interface FiltroProcessos {
  dimensoes: DimensaoProcesso[];
  sessoes: string[];
  dataInicio?: Date;
  dataFim?: Date;
  texto?: string;
}

// Interface para configurações da aplicação
export interface ConfiguracaoApp {
  pastaTrabalho: string;
  autoSave: boolean;
  intervaloAutoSave: number; // em segundos
  temaEscuro: boolean;
  showGrid: boolean;
  snapToGrid: boolean;
}

// Interface para dados de export
export interface ExportData {
  paciente: Paciente;
  sessoes: Sessao[];
  configuracao: ConfiguracaoApp;
  dataExport: Date;
  versao: string;
}

// Eventos do sistema
export interface EventoSistema {
  id: string;
  tipo: 'create' | 'update' | 'delete' | 'export' | 'import';
  entidade: 'paciente' | 'sessao' | 'processo' | 'conexao';
  entidadeId: string;
  timestamp: Date;
  dados?: any;
}

// Estado da aplicação
export interface EstadoApp {
  pacienteAtual?: Paciente;
  sessaoAtual?: Sessao;
  visualizacaoAtiva: TipoVisualizacao;
  filtros: FiltroProcessos;
  configuracao: ConfiguracaoApp;
  historico: EventoSistema[];
}