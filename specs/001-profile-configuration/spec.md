# Feature Specification: Configuração de Perfis de Exportação

**Feature Branch**: `001-profile-configuration`  
**Created**: 2024-12-30  
**Status**: Draft  
**Input**: User description: "Adicione uma funcionalidade de criação de perfis, em cada perfil é possível configurar um nome de perfil, a coluna de horas no excel e os projetos que fazem parte do perfil. O de-para deve ser global. Esse perfil serve para vc configurar no Copiar para planilha projeto"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Criar e Selecionar Perfil de Exportação (Priority: P1)

O usuário precisa criar diferentes perfis de exportação para diferentes contextos de trabalho (ex: cliente A, cliente B, projetos internos). Cada perfil deve permitir configurar um nome identificador, a coluna onde as horas serão exportadas no Excel, e quais projetos do Clockify fazem parte daquele perfil.

**Why this priority**: Esta é a funcionalidade central que permite ao usuário organizar suas configurações de exportação por contexto, eliminando a necessidade de reconfigurar manualmente a cada mudança de contexto de trabalho.

**Independent Test**: Pode ser testado criando um perfil com nome "Cliente A", definindo coluna 5 para horas, selecionando 2 projetos específicos, e verificando que o perfil é salvo e pode ser selecionado posteriormente.

**Acceptance Scenarios**:

1. **Given** o usuário está na tela de configurações de exportação, **When** clica em "Criar Novo Perfil", **Then** um formulário é exibido solicitando nome do perfil, coluna de horas, e seleção de projetos
2. **Given** o usuário preencheu os dados do perfil, **When** salva o perfil, **Then** o perfil aparece na lista de perfis disponíveis
3. **Given** existem múltiplos perfis criados, **When** o usuário seleciona um perfil específico, **Then** as configurações daquele perfil são aplicadas à funcionalidade "Copiar para Planilha Projeto"
4. **Given** um perfil está selecionado, **When** o usuário clica em "Copiar para Planilha Projeto", **Then** apenas os projetos configurados no perfil são exportados com a coluna de horas definida

---

### User Story 2 - Editar e Excluir Perfis (Priority: P2)

O usuário precisa modificar perfis existentes quando suas necessidades mudam (ex: adicionar novos projetos ao perfil, mudar a coluna de horas) ou excluir perfis que não são mais utilizados.

**Why this priority**: Permite manutenção e evolução dos perfis ao longo do tempo, garantindo que o usuário não precise criar novos perfis do zero quando pequenas mudanças são necessárias.

**Independent Test**: Pode ser testado editando um perfil existente (mudando o nome de "Cliente A" para "Cliente A - 2024"), adicionando um novo projeto, e verificando que as mudanças são persistidas. Também pode ser testado excluindo um perfil e verificando que ele não aparece mais na lista.

**Acceptance Scenarios**:

1. **Given** o usuário visualiza a lista de perfis, **When** seleciona a opção de editar um perfil, **Then** o formulário é preenchido com os dados atuais do perfil
2. **Given** o usuário modificou os dados do perfil, **When** salva as alterações, **Then** o perfil é atualizado com os novos dados
3. **Given** o usuário visualiza a lista de perfis, **When** seleciona a opção de excluir um perfil, **Then** uma confirmação é solicitada
4. **Given** o usuário confirmou a exclusão, **When** o perfil é excluído, **Then** ele não aparece mais na lista de perfis disponíveis

---

### User Story 3 - Gerenciar De-Para Global de Projetos (Priority: P3)

O usuário precisa configurar o mapeamento (de-para) entre nomes de projetos do Clockify e valores que devem aparecer no Excel. Este mapeamento deve ser global, aplicando-se a todos os perfis, mas cada perfil decide quais projetos incluir na exportação.

**Why this priority**: Evita duplicação de configuração do de-para em cada perfil e garante consistência nos valores exportados independentemente do perfil selecionado.

**Independent Test**: Pode ser testado configurando o de-para global (ex: "Projeto Interno XYZ" → "PI-XYZ"), criando dois perfis diferentes que incluem este projeto, e verificando que ambos exportam com o valor "PI-XYZ".

**Acceptance Scenarios**:

1. **Given** o usuário está na área de configurações globais, **When** acessa o de-para de projetos, **Then** uma lista de todos os projetos do Clockify é exibida com campos para configurar o valor de exportação
2. **Given** o usuário configurou um de-para para um projeto, **When** salva a configuração, **Then** o mapeamento é aplicado globalmente
3. **Given** um de-para global está configurado, **When** qualquer perfil que inclui aquele projeto é usado para exportação, **Then** o valor mapeado é utilizado no Excel
4. **Given** um projeto não tem de-para configurado, **When** é exportado, **Then** o nome original do projeto do Clockify é utilizado

---

### Edge Cases

- O que acontece quando um usuário tenta criar um perfil sem nome?
- O que acontece quando um usuário tenta criar um perfil sem selecionar nenhum projeto?
- Como o sistema lida quando um projeto configurado em um perfil é deletado do Clockify?
- O que acontece quando o usuário define uma coluna de horas inválida (ex: coluna 0 ou coluna 100)?
- Como o sistema se comporta quando não há nenhum perfil criado e o usuário tenta usar "Copiar para Planilha Projeto"?
- O que acontece quando dois perfis têm o mesmo nome?
- Como o sistema lida com a exclusão do perfil atualmente selecionado?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistema DEVE permitir criar perfis de exportação com nome único, coluna de horas configurável, e lista de projetos selecionados
- **FR-002**: Sistema DEVE validar que o nome do perfil não está vazio e tem no mínimo 3 caracteres
- **FR-003**: Sistema DEVE validar que a coluna de horas está entre 3 e 20
- **FR-004**: Sistema DEVE validar que pelo menos um projeto foi selecionado no perfil
- **FR-005**: Sistema DEVE permitir editar todos os campos de um perfil existente
- **FR-006**: Sistema DEVE permitir excluir perfis, solicitando confirmação antes da exclusão
- **FR-007**: Sistema DEVE persistir os perfis criados para uso em sessões futuras
- **FR-008**: Sistema DEVE permitir selecionar um perfil ativo que será usado na funcionalidade "Copiar para Planilha Projeto"
- **FR-009**: Sistema DEVE aplicar as configurações do perfil selecionado (coluna de horas e filtro de projetos) ao gerar o texto de exportação
- **FR-010**: Sistema DEVE manter um de-para global de projetos que mapeia nomes do Clockify para valores de exportação
- **FR-011**: Sistema DEVE permitir configurar o de-para global independentemente dos perfis
- **FR-012**: Sistema DEVE aplicar o de-para global aos projetos incluídos em qualquer perfil durante a exportação
- **FR-013**: Sistema DEVE usar o nome original do projeto quando não houver de-para configurado
- **FR-014**: Sistema DEVE exibir lista de perfis disponíveis para seleção
- **FR-015**: Sistema DEVE indicar visualmente qual perfil está atualmente selecionado
- **FR-016**: Sistema DEVE permitir operação sem perfil selecionado, usando comportamento padrão atual (todos os projetos, coluna configurada globalmente)
- **FR-017**: Sistema DEVE prevenir nomes de perfis duplicados
- **FR-018**: Sistema DEVE manter o de-para global mesmo quando projetos são removidos de perfis

### Key Entities

- **Perfil de Exportação**: Representa uma configuração nomeada contendo: identificador único, nome do perfil, número da coluna de horas no Excel (3-20), lista de IDs ou nomes de projetos do Clockify incluídos no perfil, data de criação, data de última modificação
- **De-Para de Projeto**: Representa o mapeamento global entre nome do projeto no Clockify e valor a ser exportado no Excel. Contém: identificador único (baseado no nome do projeto Clockify), nome do projeto no Clockify, valor para exportação no Excel
- **Perfil Ativo**: Referência ao perfil atualmente selecionado pelo usuário para uso na exportação

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Usuário consegue criar um novo perfil completo (nome, coluna, projetos) em menos de 1 minuto
- **SC-002**: Usuário consegue alternar entre perfis diferentes e ver as configurações aplicadas imediatamente na exportação
- **SC-003**: Configuração de de-para global é aplicada consistentemente em todos os perfis que incluem o projeto mapeado
- **SC-004**: Sistema mantém todos os perfis e configurações persistidos entre sessões do navegador
- **SC-005**: Usuário consegue identificar qual perfil está ativo através de indicação visual clara
- **SC-006**: Exportação com perfil selecionado inclui apenas os projetos configurados no perfil, respeitando a coluna de horas definida
