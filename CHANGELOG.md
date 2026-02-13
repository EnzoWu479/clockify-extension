# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Unreleased]

### 🔐 Adicionado - Sistema de Criptografia RSA

- **Criptografia RSA-2048** para proteção de API keys
  - Chaves nunca trafegam ou são armazenadas em texto plano
  - Sistema de chave pública/privada usando `.env`
  - Web Crypto API no frontend, Node.js crypto no backend

- **Migração Automática** de chaves existentes
  - Detecta automaticamente usuários com chaves antigas
  - Criptografa e migra transparentemente
  - Novo identificador no localStorage: `clockifySecretKey`
  - Zero downtime, sem ação do usuário necessária

- **Scripts**
  - `pnpm generate-keys` - Gera par de chaves RSA
  - `scripts/test-migration.js` - Testes de migração

- **Documentação**
  - [docs/SECURITY.md](docs/SECURITY.md) - Arquitetura de segurança
  - [docs/MIGRATION.md](docs/MIGRATION.md) - Processo de migração
  - [keys/README.md](keys/README.md) - Informações sobre chaves
  - [scripts/README.md](scripts/README.md) - Guia de scripts

### 🔄 Modificado

- `hooks/useClockifyApiKey.ts`
  - Implementa migração automática de `clockifyApiKey` → `clockifySecretKey`
  - Criptografa chaves antes de armazenar
  - Retorna versão criptografada para requisições

- `infra/crypto/`
  - `encryption.ts` - Criptografia no frontend
  - `decryption.ts` - Descriptografia no backend

- `app/api/clockify/time-entries/route.ts`
  - Descriptografa automaticamente chaves recebidas
  - Mantém retrocompatibilidade temporária

### 🛡️ Segurança

- API keys agora protegidas com criptografia assimétrica
- Chaves privadas armazenadas apenas em `.env` (nunca commitadas)
- Tráfego de API keys sempre criptografado
- localStorage protegido contra leitura direta

### 📝 Breaking Changes

**Nenhum breaking change para usuários finais.**

Para desenvolvedores:
- É necessário executar `pnpm generate-keys` no primeiro setup
- Variáveis `NEXT_PUBLIC_RSA_PUBLIC_KEY` (frontend) e `RSA_PRIVATE_KEY` (backend) devem estar no `.env`
- Deploy em produção requer configuração dessas variáveis

## [0.1.0] - Data Inicial

### Adicionado
- Interface de visualização de tarefas do Clockify
- Exportação para Excel com formatação customizada
- Sistema de perfis de exportação
- Controles de data e filtros
- Tour interativo para novos usuários
- Sistema de tooltips de ajuda
- Modal de FAQ
- Cache de requisições da API

### Recursos Principais
- Visualização de time entries por dia
- Exportação formatada para planilhas
- Cálculo automático de horas trabalhadas
- Suporte a múltiplos projetos
- Mapeamento de nomes de projetos para Excel
- Configuração de coluna de horas

---

## Tipos de Mudanças

- `Adicionado` para novas funcionalidades.
- `Modificado` para mudanças em funcionalidades existentes.
- `Descontinuado` para funcionalidades que serão removidas.
- `Removido` para funcionalidades removidas.
- `Corrigido` para correção de bugs.
- `Segurança` para vulnerabilidades corrigidas.
