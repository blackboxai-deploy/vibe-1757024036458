'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Processo } from '@/types';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ResultadoBusca {
  processo: Processo;
  sessaoData: string;
  pacienteNome: string;
  relevancia: number;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const { estado } = useApp();
  const [termoBusca, setTermoBusca] = useState('');
  const [resultados, setResultados] = useState<ResultadoBusca[]>([]);
  const [buscando, setBuscando] = useState(false);

  // Função de busca
  const realizarBusca = async (termo: string) => {
    if (!termo.trim() || !estado.pacienteAtual) {
      setResultados([]);
      return;
    }

    setBuscando(true);
    try {
      const resultadosEncontrados: ResultadoBusca[] = [];
      const termoLower = termo.toLowerCase();

      // Buscar em todas as sessões do paciente atual
      estado.pacienteAtual.sessoes.forEach(sessao => {
        sessao.processos?.forEach(processo => {
          const textoProcesso = processo.texto.toLowerCase();
          
          // Verificar se o termo está presente no texto
          if (textoProcesso.includes(termoLower)) {
            // Calcular relevância simples (número de ocorrências)
            const ocorrencias = (textoProcesso.match(new RegExp(termoLower, 'g')) || []).length;
            
            resultadosEncontrados.push({
              processo,
              sessaoData: new Date(sessao.data).toLocaleDateString('pt-BR'),
              pacienteNome: estado.pacienteAtual!.nome,
              relevancia: ocorrencias
            });
          }
        });
      });

      // Ordenar por relevância (mais ocorrências primeiro)
      resultadosEncontrados.sort((a, b) => b.relevancia - a.relevancia);
      setResultados(resultadosEncontrados);
    } catch (error) {
      console.error('Erro ao realizar busca:', error);
      setResultados([]);
    } finally {
      setBuscando(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      realizarBusca(termoBusca);
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [termoBusca, estado.pacienteAtual]);

  // Limpar busca quando o dialog fechar
  useEffect(() => {
    if (!open) {
      setTermoBusca('');
      setResultados([]);
    }
  }, [open]);

  const destacarTexto = (texto: string, termo: string) => {
    if (!termo) return texto;

    const regex = new RegExp(`(${termo})`, 'gi');
    const partes = texto.split(regex);

    return (
      <span>
        {partes.map((parte, index) => 
          regex.test(parte) ? (
            <mark key={index} className="bg-yellow-200 px-1 rounded">
              {parte}
            </mark>
          ) : (
            parte
          )
        )}
      </span>
    );
  };

  const getDimensaoColor = (dimensao: string) => {
    const cores: Record<string, string> = {
      'afeto': 'bg-red-100 text-red-800',
      'cognição': 'bg-teal-100 text-teal-800',
      'atenção': 'bg-blue-100 text-blue-800',
      'motivação': 'bg-yellow-100 text-yellow-800',
      'self': 'bg-purple-100 text-purple-800',
      'biofisiologico': 'bg-green-100 text-green-800',
      'contexto': 'bg-orange-100 text-orange-800',
      'sociocultural': 'bg-indigo-100 text-indigo-800'
    };
    
    return cores[dimensao] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Buscar Processos</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Campo de Busca */}
          <div className="relative">
            <Input
              placeholder="Digite o termo de busca..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="pr-20"
              autoFocus
            />
            {buscando && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Estatísticas da Busca */}
          {termoBusca && (
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                {resultados.length} resultado{resultados.length !== 1 ? 's' : ''} encontrado{resultados.length !== 1 ? 's' : ''}
                {termoBusca && ` para "${termoBusca}"`}
              </span>
              {estado.pacienteAtual && (
                <Badge variant="outline">
                  Paciente: {estado.pacienteAtual.nome}
                </Badge>
              )}
            </div>
          )}

          <Separator />

          {/* Resultados da Busca */}
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {!termoBusca ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  </div>
                  <p className="text-sm">Digite um termo para buscar nos processos</p>
                  <p className="text-xs mt-2">A busca será feita em todas as sessões do paciente atual</p>
                </div>
              ) : resultados.length === 0 && !buscando ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
                  </div>
                  <p className="text-sm">Nenhum resultado encontrado</p>
                  <p className="text-xs mt-2">Tente usar outros termos de busca</p>
                </div>
              ) : (
                resultados.map((resultado, index) => (
                  <div 
                    key={`${resultado.processo.id}-${index}`}
                    className="border rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getDimensaoColor(resultado.processo.dimensao)}`}
                        >
                          {resultado.processo.dimensao}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          Sessão: {resultado.sessaoData}
                        </span>
                      </div>
                      {resultado.relevancia > 1 && (
                        <Badge variant="outline" className="text-xs">
                          {resultado.relevancia} ocorrências
                        </Badge>
                      )}
                    </div>

                    <div className="text-sm">
                      {destacarTexto(resultado.processo.texto, termoBusca)}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-500">
                        ID: {resultado.processo.id}
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-xs h-6"
                      >
                        Ir para processo
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Ações */}
          <Separator />
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}