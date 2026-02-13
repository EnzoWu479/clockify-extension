# Scripts Utilitários

Este diretório contém scripts utilitários para desenvolvimento e manutenção do projeto.

## 📋 Scripts Disponíveis

### 🔑 generate-keys.mjs

Gera o par de chaves RSA para criptografia de API keys.

**Uso:**
```bash
pnpm generate-keys
# ou
node scripts/generate-keys.mjs
```

**O que faz:**
- Gera chaves RSA-2048 (pública e privada)
- Adiciona/atualiza `NEXT_PUBLIC_RSA_PUBLIC_KEY` e `RSA_PRIVATE_KEY` no `.env`
- Preserva outras variáveis de ambiente existentes

**Quando usar:**
- Setup inicial do projeto
- Rotação de chaves (se necessário)
- Após clonar o repositório

### 🧪 test-migration.js

Script de teste para validar migração automática de API keys.

**Uso:**
```javascript
// No DevTools Console da aplicação:

// 1. Cole o conteúdo do arquivo test-migration.js no console

// 2. Use os comandos disponíveis:
testLegacyUser()       // Simula usuário com chave antiga
checkMigrationStatus() // Verifica status da migração
resetKeys()            // Remove todas as chaves
```

**Cenários de teste:**

1. **Usuário com chave antiga:**
   ```javascript
   testLegacyUser();
   // Recarregue a página para ver a migração
   ```

2. **Verificar migração:**
   ```javascript
   checkMigrationStatus();
   // Mostra detalhes da chave criptografada
   ```

3. **Reset completo:**
   ```javascript
   resetKeys();
   // Remove todas as chaves
   ```

## 📝 Notas

- Todos os scripts devem ser executados da raiz do projeto
- Scripts `.mjs` usam ES Modules nativos do Node.js
- Scripts de teste não modificam código, apenas dados do localStorage

## 🔗 Referências

- [Documentação de Segurança](../docs/SECURITY.md)
- [Documentação de Migração](../docs/MIGRATION.md)
