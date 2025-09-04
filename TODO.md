# TODO - App de Mapas de Processos Psicológicos

## ✅ Setup Inicial
- [x] Criar sandbox e ambiente de desenvolvimento
- [x] Configurar estrutura base do projeto

## 🔄 Implementação Principal

### 1. Modelos de Dados e Types
- [ ] Criar interfaces TypeScript (Paciente, Processo, Conexao, Matriz)
- [ ] Configurar sistema de cores para dimensões
- [ ] Implementar validações de dados

### 2. Sistema de Armazenamento Local
- [ ] Implementar File System API para seleção de pastas
- [ ] Criar sistema de persistência local (JSON)
- [ ] Estruturar hierarquia de arquivos (Pacientes/Sessões/Rede/Dados)
- [ ] Auto-save e backup

### 3. Interface Base
- [ ] Layout principal com sidebar e header
- [ ] Navegação e breadcrumbs
- [ ] Sistema de busca global
- [ ] Atalhos de teclado

### 4. Gestão de Pacientes
- [ ] Formulário de criação de pacientes
- [ ] Lista/grid de pacientes existentes
- [ ] Edição e exclusão de pacientes
- [ ] Filtros e ordenação

### 5. Gestão de Sessões
- [ ] Criar nova sessão por data
- [ ] Lista cronológica de sessões
- [ ] Navegação entre sessões

### 6. Editor de Processos
- [ ] Botão flutuante para adicionar processos
- [ ] Modal para inserir texto e selecionar dimensão
- [ ] Sistema de drag & drop para conexões
- [ ] Diferentes tipos de setas/conexões

### 7. Visualização em Rede (Flowchart)
- [ ] Canvas interativo com zoom/pan
- [ ] Renderização de processos como nodes coloridos
- [ ] Conexões como edges direcionais
- [ ] Filtros por dimensão
- [ ] Toggle Microprocesso vs Rede Geral

### 8. Visualização da Matriz 3x3
- [ ] Grid 3x3 com quadrantes específicos
- [ ] Sistema de drag & drop para organizar processos
- [ ] Visualização sem conexões
- [ ] Labels para cada quadrante

### 9. Visualização Combinada
- [ ] Matriz como background com rede sobreposta
- [ ] Toggle para mostrar/esconder elementos
- [ ] Sincronização entre visualizações

### 10. Sistema de Busca e Filtros
- [ ] Busca global em todos os processos
- [ ] Filtros por dimensão, sessão, data
- [ ] Highlighting de resultados
- [ ] Filtros avançados

### 11. Relatórios e Export
- [ ] Geração de PDF individual por sessão
- [ ] PDF comparativo de evolução
- [ ] Export JSON para backup
- [ ] Funcionalidade de impressão

### 12. Image Processing (AUTOMATIC)
- [ ] **AUTOMATIC**: Process placeholder images (placehold.co URLs) → AI-generated images
  - This step executes automatically when placeholders are detected
  - No manual action required - system triggers automatically
  - Ensures all images are ready before testing

### 13. Testes e Validação
- [ ] API testing com curl
- [ ] Validação de funcionalidades principais
- [ ] Testes de armazenamento local
- [ ] Performance e responsividade

### 14. Build e Deploy
- [ ] Build final da aplicação
- [ ] Testes de produção
- [ ] Preview final da aplicação

---

## Observações Técnicas
- **Armazenamento:** 100% local, sem cloud
- **Estrutura:** Processos Clinicos/Pacientes/[Nome]/Sessões/Rede/Dados
- **Matriz:** 3x3 com dimensões específicas posicionadas
- **Cores:** Sistema diferenciado para cada dimensão
- **Atalhos:** Implementar todos os atalhos de teclado planejados