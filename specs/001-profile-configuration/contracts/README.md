# API Contracts

**Feature**: 001-profile-configuration  
**Date**: 2024-12-30

## Overview

Este diretório normalmente conteria contratos de API (OpenAPI, GraphQL schemas, etc.) para features que envolvem comunicação backend/frontend.

## Not Applicable

Esta feature **não possui contratos de API externos** porque:

1. **Aplicação 100% Client-Side**: Toda a lógica roda no navegador
2. **Persistência Local**: Dados armazenados em IndexedDB (local storage)
3. **Sem Backend**: Não há endpoints HTTP, GraphQL, ou qualquer API externa

## Internal Contracts

Os "contratos" desta feature são as **interfaces TypeScript** definidas em:

- **Domain Layer**: `src/domain/export-profile.ts`
  - `ExportProfile` type
  - `ActiveProfile` type
  - `ExportProfileRepository` interface
  - `ActiveProfileRepository` interface

- **Hook Layer**: `hooks/useExportProfiles.ts` e `hooks/useActiveProfile.ts`
  - Assinaturas de funções exportadas
  - Tipos de retorno dos hooks
  - Tipos de parâmetros

Estes contratos são documentados em detalhes no arquivo `data-model.md`.

## Integration Points

A feature integra com:

1. **IndexedDB API** (browser nativo)
   - Não requer contrato externo
   - Schema documentado em `data-model.md`

2. **Funcionalidade Existente**
   - `useProjectMappings`: Sem modificações
   - `useClockifyExportText`: Modificação para aceitar filtro opcional
   - Contratos existentes são preservados (backward compatible)

## Type Safety

TypeScript garante type safety em tempo de compilação para todos os contratos internos. Não há necessidade de validação de schema em runtime para APIs externas.
