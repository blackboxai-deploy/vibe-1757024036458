// Sistema de gerenciamento de arquivos local para o app de psicólogos

import { Paciente, Sessao, ConfiguracaoApp, ExportData } from '@/types';

// Interface para o File System Access API
interface FileSystemHandle {
  kind: 'file' | 'directory';
  name: string;
}

interface FileSystemDirectoryHandle extends FileSystemHandle {
  kind: 'directory';
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FileSystemDirectoryHandle>;
  entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
}

interface FileSystemFileHandle extends FileSystemHandle {
  kind: 'file';
  getFile(): Promise<File>;
  createWritable(): Promise<FileSystemWritableFileStream>;
}

declare global {
  interface Window {
    showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
    showSaveFilePicker(options?: any): Promise<FileSystemFileHandle>;
    showOpenFilePicker(options?: any): Promise<FileSystemFileHandle[]>;
  }
}

export class SistemaArquivos {
  private pastaRaiz: FileSystemDirectoryHandle | null = null;
  private readonly ESTRUTURA_PASTAS = {
    PACIENTES: 'Pacientes',
    SESSOES: 'Sessões',
    TESTES: 'Testes', 
    REDE: 'Rede',
    DADOS: 'Dados'
  };

  // Verificar se o navegador suporta File System Access API
  static get isSupported(): boolean {
    return 'showDirectoryPicker' in window;
  }

  // Solicitar permissão e selecionar pasta de trabalho
  async selecionarPastaTrabalho(): Promise<string> {
    try {
      if (!SistemaArquivos.isSupported) {
        throw new Error('File System Access API não é suportada neste navegador');
      }

      this.pastaRaiz = await window.showDirectoryPicker();
      await this.criarEstruturaPastas();
      
      return this.pastaRaiz.name;
    } catch (error) {
      console.error('Erro ao selecionar pasta de trabalho:', error);
      throw error;
    }
  }

  // Criar estrutura de pastas necessária
  private async criarEstruturaPastas(): Promise<void> {
    if (!this.pastaRaiz) return;

    try {
      // Criar pasta Processos Clinicos se não existir
      const pastaProcessos = await this.pastaRaiz.getDirectoryHandle('Processos Clinicos', { create: true });
      
      // Criar pasta Pacientes
      await pastaProcessos.getDirectoryHandle(this.ESTRUTURA_PASTAS.PACIENTES, { create: true });
      
      console.log('Estrutura de pastas criada com sucesso');
    } catch (error) {
      console.error('Erro ao criar estrutura de pastas:', error);
      throw error;
    }
  }

  // Salvar paciente
  async salvarPaciente(paciente: Paciente): Promise<void> {
    if (!this.pastaRaiz) throw new Error('Pasta de trabalho não selecionada');

    try {
      const pastaProcessos = await this.pastaRaiz.getDirectoryHandle('Processos Clinicos');
      const pastaPacientes = await pastaProcessos.getDirectoryHandle(this.ESTRUTURA_PASTAS.PACIENTES);
      
      // Criar pasta do paciente
      const pastaPaciente = await pastaPacientes.getDirectoryHandle(
        this.sanitizarNomeArquivo(paciente.nome), 
        { create: true }
      );

      // Criar subpastas
      await pastaPaciente.getDirectoryHandle(this.ESTRUTURA_PASTAS.SESSOES, { create: true });
      await pastaPaciente.getDirectoryHandle(this.ESTRUTURA_PASTAS.TESTES, { create: true });
      await pastaPaciente.getDirectoryHandle(this.ESTRUTURA_PASTAS.REDE, { create: true });
      await pastaPaciente.getDirectoryHandle(this.ESTRUTURA_PASTAS.DADOS, { create: true });

      // Salvar dados do paciente
      const arquivoDados = await pastaPaciente.getFileHandle('dados.json', { create: true });
      const writable = await arquivoDados.createWritable();
      await writable.write(JSON.stringify(paciente, null, 2));
      await writable.close();

      console.log(`Paciente ${paciente.nome} salvo com sucesso`);
    } catch (error) {
      console.error('Erro ao salvar paciente:', error);
      throw error;
    }
  }

  // Carregar paciente
  async carregarPaciente(nomePaciente: string): Promise<Paciente | null> {
    if (!this.pastaRaiz) throw new Error('Pasta de trabalho não selecionada');

    try {
      const pastaProcessos = await this.pastaRaiz.getDirectoryHandle('Processos Clinicos');
      const pastaPacientes = await pastaProcessos.getDirectoryHandle(this.ESTRUTURA_PASTAS.PACIENTES);
      const pastaPaciente = await pastaPacientes.getDirectoryHandle(this.sanitizarNomeArquivo(nomePaciente));
      
      const arquivoDados = await pastaPaciente.getFileHandle('dados.json');
      const file = await arquivoDados.getFile();
      const conteudo = await file.text();
      
      return JSON.parse(conteudo) as Paciente;
    } catch (error) {
      console.error('Erro ao carregar paciente:', error);
      return null;
    }
  }

  // Listar todos os pacientes
  async listarPacientes(): Promise<string[]> {
    if (!this.pastaRaiz) return [];

    try {
      const pastaProcessos = await this.pastaRaiz.getDirectoryHandle('Processos Clinicos');
      const pastaPacientes = await pastaProcessos.getDirectoryHandle(this.ESTRUTURA_PASTAS.PACIENTES);
      
      const pacientes: string[] = [];
      for await (const [nome, handle] of pastaPacientes.entries()) {
        if (handle.kind === 'directory') {
          pacientes.push(nome);
        }
      }
      
      return pacientes.sort();
    } catch (error) {
      console.error('Erro ao listar pacientes:', error);
      return [];
    }
  }

  // Salvar sessão
  async salvarSessao(pacienteNome: string, sessao: Sessao): Promise<void> {
    if (!this.pastaRaiz) throw new Error('Pasta de trabalho não selecionada');

    try {
      const pastaProcessos = await this.pastaRaiz.getDirectoryHandle('Processos Clinicos');
      const pastaPacientes = await pastaProcessos.getDirectoryHandle(this.ESTRUTURA_PASTAS.PACIENTES);
      const pastaPaciente = await pastaPacientes.getDirectoryHandle(this.sanitizarNomeArquivo(pacienteNome));
      const pastaSessoes = await pastaPaciente.getDirectoryHandle(this.ESTRUTURA_PASTAS.SESSOES);

      const nomeArquivo = `sessao_${this.formatarDataArquivo(sessao.data)}.json`;
      const arquivoSessao = await pastaSessoes.getFileHandle(nomeArquivo, { create: true });
      
      const writable = await arquivoSessao.createWritable();
      await writable.write(JSON.stringify(sessao, null, 2));
      await writable.close();

      console.log(`Sessão ${nomeArquivo} salva com sucesso`);
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
      throw error;
    }
  }

  // Carregar sessões de um paciente
  async carregarSessoes(pacienteNome: string): Promise<Sessao[]> {
    if (!this.pastaRaiz) return [];

    try {
      const pastaProcessos = await this.pastaRaiz.getDirectoryHandle('Processos Clinicos');
      const pastaPacientes = await pastaProcessos.getDirectoryHandle(this.ESTRUTURA_PASTAS.PACIENTES);
      const pastaPaciente = await pastaPacientes.getDirectoryHandle(this.sanitizarNomeArquivo(pacienteNome));
      const pastaSessoes = await pastaPaciente.getDirectoryHandle(this.ESTRUTURA_PASTAS.SESSOES);

      const sessoes: Sessao[] = [];
      for await (const [nome, handle] of pastaSessoes.entries()) {
        if (handle.kind === 'file' && nome.endsWith('.json')) {
          const fileHandle = handle as FileSystemFileHandle;
          const file = await fileHandle.getFile();
          const conteudo = await file.text();
          sessoes.push(JSON.parse(conteudo) as Sessao);
        }
      }

      return sessoes.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
      return [];
    }
  }

  // Export completo para PDF/JSON
  async exportarDados(pacienteNome: string, formato: 'json' | 'pdf' = 'json'): Promise<void> {
    try {
      const paciente = await this.carregarPaciente(pacienteNome);
      if (!paciente) throw new Error('Paciente não encontrado');

      const sessoes = await this.carregarSessoes(pacienteNome);
      
      const dadosExport: ExportData = {
        paciente,
        sessoes,
        configuracao: this.obterConfiguracaoApp(),
        dataExport: new Date(),
        versao: '1.0.0'
      };

      if (formato === 'json') {
        await this.salvarArquivoExport(
          `${pacienteNome}_backup_${this.formatarDataArquivo(new Date())}.json`,
          JSON.stringify(dadosExport, null, 2)
        );
      }
      // Implementar export PDF futuramente
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      throw error;
    }
  }

  // Salvar arquivo de export
  private async salvarArquivoExport(nomeArquivo: string, conteudo: string): Promise<void> {
    const fileHandle = await window.showSaveFilePicker({
      suggestedName: nomeArquivo,
      types: [{
        description: 'JSON files',
        accept: { 'application/json': ['.json'] }
      }]
    });

    const writable = await fileHandle.createWritable();
    await writable.write(conteudo);
    await writable.close();
  }

  // Utilitários privados
  private sanitizarNomeArquivo(nome: string): string {
    return nome.replace(/[<>:"/\\|?*]/g, '_').trim();
  }

  private formatarDataArquivo(data: Date): string {
    return data.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  private obterConfiguracaoApp(): ConfiguracaoApp {
    return {
      pastaTrabalho: this.pastaRaiz?.name || '',
      autoSave: true,
      intervaloAutoSave: 30,
      temaEscuro: false,
      showGrid: true,
      snapToGrid: false
    };
  }
}

// Instância singleton
export const sistemaArquivos = new SistemaArquivos();