# Sistema de Criptografia da API Key

## 🔐 Visão Geral

Este projeto implementa criptografia assimétrica RSA-2048 para proteger a API key do Clockify do usuário. A chave nunca trafega ou é armazenada em texto plano.

## 🏗️ Arquitetura

### Componentes

### 1. **Chaves RSA** (`.env`)
   - `NEXT_PUBLIC_RSA_PUBLIC_KEY` - Chave pública (2048 bits) - Exposta ao frontend
   - `RSA_PRIVATE_KEY` - Chave privada (2048 bits) - **Apenas backend, NUNCA commitada**
   - Geradas via `pnpm generate-keys`

2. **Frontend** (`infra/crypto/encryption.ts`)
   - Usa Web Crypto API nativa do navegador
   - Algoritmo: RSA-OAEP com hash SHA-256
   - Criptografa antes de salvar no localStorage
   - Lê chave pública de `process.env.NEXT_PUBLIC_RSA_PUBLIC_KEY`

3. **Backend** (`infra/crypto/decryption.ts`)
   - Usa módulo `crypto` do Node.js
   - Descriptografa requisições recebidas
   - Chave privada lida de `process.env.RSA_PRIVATE_KEY`

4. **Hook** (`hooks/useClockifyApiKey.ts`)
   - Gerencia estado da API key
   - Criptografa antes de armazenar
   - Retorna versão criptografada para requisições

5. **API Routes** (`app/api/clockify/time-entries/route.ts`)
   - Recebe chave criptografada no header
   - Descriptografa antes de usar
   - Mantém cache usando chave criptografada como identificador

## 🔄 Migração Automática

Para garantir que usuários existentes tenham suas chaves protegidas automaticamente:

- **Chave antiga**: `clockifyApiKey` (plain text)
- **Chave nova**: `clockifySecretKey` (criptografada)

Quando o app detecta uma chave antiga:
1. Criptografa automaticamente usando RSA-2048
2. Move para o novo identificador
3. Remove a chave antiga
4. ✅ Processo transparente e sem downtime

📖 Veja [MIGRATION.md](./MIGRATION.md) para detalhes completos sobre a migração.

## 🔄 Fluxo de Dados

### 1. Configuração Inicial
```
Usuário digita API key
      ↓
Frontend chama activateKey()
      ↓
Criptografa com RSA-OAEP (chave pública)
      ↓
Salva versão criptografada no localStorage
      ↓
Limpa versão plain text da memória
```

### 2. Requisição à API
```
Frontend carrega chave criptografada do localStorage
      ↓
Envia no header x-clockify-api-key (criptografada)
      ↓
Backend recebe e verifica se está criptografada
      ↓
Descriptografa com chave privada
      ↓
Usa versão descriptografada para chamar Clockify API
      ↓
Retorna dados para o frontend
```

## 🛡️ Benefícios de Segurança

1. **Proteção em Repouso**
   - API key armazenada criptografada no localStorage
   - Impossível ler diretamente via DevTools

2. **Proteção em Trânsito**
   - Chave trafega criptografada do frontend para backend
   - Mesmo que interceptada, não pode ser lida sem a chave privada

3. **Isolamento de Chaves**
   - Chave privada nunca sai do servidor
   - Chave pública exposta é segura (apenas criptografa, não descriptografa)

4. **Zero Plain Text**
   - Chave nunca fica em texto plano após ativação
   - Campo de input limpo automaticamente após salvar

## 📋 Configuração

### Setup Inicial

1. **Gerar Chaves**
   ```bash
   pnpm generate-keys
   ```

2. **Verificar Variáveis Criadas no `.env`**
   - `NEXT_PUBLIC_RSA_PUBLIC_KEY` (exposta ao frontend)
   - `RSA_PRIVATE_KEY` (apenas backend)

3. **Desenvolvimento**
   ```bash
   pnpm dev
   ```

### Deploy em Produção

1. **Configure as variáveis de ambiente no servidor de produção**
   - `NEXT_PUBLIC_RSA_PUBLIC_KEY` - Copie do seu `.env` local
   - `RSA_PRIVATE_KEY` - Copie do seu `.env` local
   
   **OU**
   
   Execute `pnpm generate-keys` no servidor para gerar novas chaves

2. **Garantir que `.env` não está no controle de versão**
   - Já configurado no `.gitignore`

3. **Chave pública será incluída no bundle** (seguro)
   - Variáveis com prefixo `NEXT_PUBLIC_` são automaticamente expostas ao frontend pelo Next.js
   - A chave pública pode ser exposta sem riscos (apenas criptografa, não descriptografa)

## 🔧 Manutenção

### Rotação de Chaves

Se necessário rotacionar as chaves:

1. Execute `pnpm generate-keys` novamente
2. Reinicie o servidor
3. Usuários precisarão reinserir suas API keys

### Retrocompatibilidade

O sistema detecta automaticamente se uma chave está criptografada:
- Chaves criptografadas: ~344+ caracteres em base64
- Se não criptografada, aceita temporariamente (facilita migração)

## 🧪 Testes

Para testar o sistema:

1. Insira uma API key
2. Verifique localStorage - deve estar criptografada
3. Faça uma requisição - deve funcionar normalmente
4. Recarregue a página - deve manter autenticação

## 📚 Referências

- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [Node.js Crypto](https://nodejs.org/api/crypto.html)
- [RSA-OAEP](https://en.wikipedia.org/wiki/Optimal_asymmetric_encryption_padding)
