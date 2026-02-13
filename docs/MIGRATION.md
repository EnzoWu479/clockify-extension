# Migração Automática de API Keys

## 📋 Visão Geral

Este sistema implementa uma migração automática e transparente de API keys para usuários existentes, adicionando criptografia de segurança sem requerer ação do usuário.

## 🔄 Como Funciona

### Antes da Migração
- **Key no localStorage**: `clockifyApiKey`
- **Formato**: Plain text (não criptografado)
- **Exemplo**: `"NDA2ZjE1YjItYjU0Zi00MmRlLTk..."`

### Depois da Migração
- **Key no localStorage**: `clockifySecretKey`
- **Formato**: RSA-2048 criptografado em base64
- **Exemplo**: `"YXNkZmFzZGY...="` (~344 caracteres)

## 🚀 Processo de Migração

### 1. Detecção Automática

Quando o app carrega (`useClockifyApiKey` hook):

```typescript
// 1. Verifica se existe a nova chave
const newKey = localStorage.getItem('clockifySecretKey');

if (newKey) {
  // ✅ Já está migrado, usa normalmente
  return;
}

// 2. Se não existe, verifica a chave antiga
const legacyKey = localStorage.getItem('clockifyApiKey');

if (legacyKey) {
  // 🔄 Precisa migrar
  startMigration(legacyKey);
}
```

### 2. Processo de Criptografia

```typescript
async function startMigration(legacyKey: string) {
  // 1. Criptografa a chave antiga usando RSA-2048
  const encrypted = await encryptApiKey(legacyKey);
  
  // 2. Salva na nova key
  localStorage.setItem('clockifySecretKey', encrypted);
  
  // 3. Remove a chave antiga
  localStorage.removeItem('clockifyApiKey');
  
  // 4. Log de sucesso
  console.log('✅ API Key migrada com sucesso');
}
```

### 3. Tratamento de Erros

Se a migração falhar:
- A chave antiga é **mantida** (não perde dados)
- Log de erro é exibido no console
- Usuário pode tentar novamente recarregando a página

## 🎯 Cenários de Uso

### Cenário 1: Usuário Novo
1. Insere API key pela primeira vez
2. Key é criptografada imediatamente
3. Salva como `clockifySecretKey`
4. ✅ Nenhuma migração necessária

### Cenário 2: Usuário Existente (Versão Antiga)
1. Possui `clockifyApiKey` em plain text
2. Ao carregar o app, migração detecta a chave antiga
3. Criptografa automaticamente
4. Move para `clockifySecretKey`
5. Remove `clockifyApiKey`
6. ✅ Migração completa e transparente

### Cenário 3: Usuário Já Migrado
1. Possui `clockifySecretKey` criptografada
2. App detecta e usa normalmente
3. ✅ Sem ação necessária

## 🔐 Segurança

### Benefícios da Migração

1. **Proteção Imediata**
   - Chaves antigas em plain text são criptografadas
   - Usuários ganham segurança automaticamente

2. **Zero Downtime**
   - Migração acontece em background
   - App continua funcionando normalmente

3. **Sem Perda de Dados**
   - Em caso de erro, chave antiga é preservada
   - Usuário não precisa reconfigurar

4. **Transparente**
   - Usuário não vê ou sente a migração
   - Apenas um log informativo no console

## 🧪 Como Testar a Migração

### Teste Manual

1. **Simular usuário antigo:**
   ```javascript
   // No DevTools Console
   localStorage.setItem('clockifyApiKey', 'test-plain-key-123');
   localStorage.removeItem('clockifySecretKey');
   location.reload();
   ```

2. **Verificar migração:**
   ```javascript
   // Após reload
   console.log('Chave antiga:', localStorage.getItem('clockifyApiKey')); // null
   console.log('Chave nova:', localStorage.getItem('clockifySecretKey')); // criptografada
   ```

3. **Validar formato:**
   ```javascript
   const encrypted = localStorage.getItem('clockifySecretKey');
   console.log('Tamanho:', encrypted?.length); // ~344 caracteres
   console.log('É base64?', /^[A-Za-z0-9+/]+=*$/.test(encrypted)); // true
   ```

### Teste Automatizado

```typescript
describe('API Key Migration', () => {
  it('should migrate legacy key automatically', async () => {
    // Setup: adiciona chave antiga
    localStorage.setItem('clockifyApiKey', 'legacy-key');
    
    // Act: carrega componente
    const { result } = renderHook(() => useClockifyApiKey());
    
    // Wait: aguarda migração
    await waitFor(() => {
      expect(result.current.hasKey).toBe(true);
    });
    
    // Assert: verifica migração
    expect(localStorage.getItem('clockifyApiKey')).toBeNull();
    expect(localStorage.getItem('clockifySecretKey')).toBeTruthy();
  });
});
```

## 📊 Monitoramento

### Logs de Sucesso

```
✅ API Key migrada com sucesso para versão criptografada
```

### Logs de Erro

```
❌ Erro ao migrar API key: [detalhes do erro]
```

## 🔧 Manutenção

### Remover Código de Migração (Futuro)

Após algum tempo (ex: 6 meses), quando todos os usuários tiverem migrado:

1. Remover constante `LEGACY_STORAGE_KEY`
2. Remover lógica de detecção de chave antiga
3. Simplificar `useEffect` inicial
4. Manter apenas leitura de `clockifySecretKey`

### Exemplo de Código Simplificado (Pós-Migração)

```typescript
useEffect(() => {
  if (typeof window === "undefined") return;
  
  const encryptedKey = window.localStorage.getItem(CURRENT_STORAGE_KEY);
  
  if (encryptedKey) {
    setEncryptedApiKey(encryptedKey);
    setIsKeyActive(true);
  }
}, []);
```

## 📝 Notas Importantes

1. **Compatibilidade**: Sistema suporta ambas as versões durante período de transição
2. **Segurança**: Chave antiga é removida após migração bem-sucedida
3. **Performance**: Migração acontece uma única vez por usuário
4. **Rollback**: Em caso de problema, usuário pode reconfigurar a chave
5. **Logging**: Todos os passos são logados para debug

## 🎓 Referências

- [Hook: useClockifyApiKey.ts](../hooks/useClockifyApiKey.ts)
- [Encryption: infra/crypto/encryption.ts](../infra/crypto/encryption.ts)
- [Security Architecture](./SECURITY.md)
