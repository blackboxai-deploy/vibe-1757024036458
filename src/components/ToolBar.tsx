'use client';

import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TipoVisualizacao, DimensaoProcesso, CORES_DIMENSOES } from '@/types';

export function ToolBar() {
  const { estado, alterarVisualizacao, atualizarFiltros, salvarDados, podeEditar } = useApp();

  const tiposVisualizacao: { value: TipoVisualizacao; label: string }[] = [
    { value: 'rede', label: 'Rede' },
    { value: 'matriz', label: 'Matriz' },
    { value: 'combinada', label: 'Combinada' },
    { value: 'microprocessos', label: 'Microprocessos' }
  ];

  const dimensoes: DimensaoProcesso[] = [
    'afeto', 'cognição', 'atenção', 'motivação', 'self',
    'biofisiologico', 'contexto', 'sociocultural'
  ];

  const toggleFiltro = (dimensao: DimensaoProcesso) => {
    const filtrosAtuais = estado.filtros.dimensoes;
    const novosFiltros = filtrosAtuais.includes(dimensao)
      ? filtrosAtuais.filter(d => d !== dimensao)
      : [...filtrosAtuais, dimensao];
    
    atualizarFiltros({ dimensoes: novosFiltros });
  };

  const limparFiltros = () => {
    atualizarFiltros({ dimensoes: [], texto: '' });
  };

  const handleSalvar = async () => {
    try {
      await salvarDados();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  return (
    <div className="h-14 bg-white border-b flex items-center justify-between px-6">
      {/* Controles de Visualização */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Visualização:</span>
          <Select
            value={estado.visualizacaoAtiva}
            onValueChange={(value) => alterarVisualizacao(value as TipoVisualizacao)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tiposVisualizacao.map((tipo) => (
                <SelectItem key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Filtros por Dimensão */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Filtros:</span>
          <div className="flex items-center space-x-1">
            {dimensoes.map((dimensao) => (
              <Button
                key={dimensao}
                size="sm"
                variant={estado.filtros.dimensoes.includes(dimensao) ? "default" : "outline"}
                className="text-xs h-7 px-2"
                style={{
                  backgroundColor: estado.filtros.dimensoes.includes(dimensao) 
                    ? CORES_DIMENSOES[dimensao] 
                    : undefined,
                  borderColor: CORES_DIMENSOES[dimensao],
                  color: estado.filtros.dimensoes.includes(dimensao) ? 'white' : CORES_DIMENSOES[dimensao]
                }}
                onClick={() => toggleFiltro(dimensao)}
              >
                {dimensao.charAt(0).toUpperCase() + dimensao.slice(1)}
              </Button>
            ))}
            
            {estado.filtros.dimensoes.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                className="text-xs h-7"
                onClick={limparFiltros}
              >
                Limpar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Ações Principais */}
      <div className="flex items-center space-x-3">
        {/* Informações da Sessão Atual */}
        {estado.sessaoAtual && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Badge variant="outline">
              {estado.sessaoAtual.processos?.length || 0} processos
            </Badge>
            <Badge variant="outline">
              {estado.sessaoAtual.conexoes?.length || 0} conexões
            </Badge>
          </div>
        )}

        <Separator orientation="vertical" className="h-6" />

        {/* Botões de Ação */}
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            disabled={!podeEditar}
            className="h-8"
          >
            Adicionar Processo
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={!estado.sessaoAtual}
            onClick={handleSalvar}
            className="h-8"
          >
            Salvar
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={!estado.pacienteAtual}
            className="h-8"
          >
            Exportar PDF
          </Button>
        </div>
      </div>
    </div>
  );
}