/**
 * Script de teste para migração de API Keys
 *
 * Execute este script no DevTools Console para testar a migração automática
 */

// Cenário 1: Simular usuário com chave antiga (plain text)
function testLegacyUser() {
  console.log("🧪 Testando cenário: Usuário com chave antiga\n");

  // Limpa estado atual
  localStorage.removeItem("clockifyApiKey");
  localStorage.removeItem("clockifySecretKey");

  // Simula chave antiga
  const legacyKey = "NDA2ZjE1YjItYjU0Zi00MmRlLTk1YzItMzQ4ZGE0OWJkOTYx";
  localStorage.setItem("clockifyApiKey", legacyKey);

  console.log("✅ Chave antiga configurada:", legacyKey);
  console.log("🔄 Recarregue a página para ver a migração automática\n");
  console.log("Após recarregar, verifique:");
  console.log('  - localStorage.getItem("clockifyApiKey") // deve ser null');
  console.log(
    '  - localStorage.getItem("clockifySecretKey") // deve existir e estar criptografada',
  );
}

// Cenário 2: Verificar estado após migração
function checkMigrationStatus() {
  console.log("🔍 Verificando status da migração\n");

  const legacyKey = localStorage.getItem("clockifyApiKey");
  const newKey = localStorage.getItem("clockifySecretKey");

  console.log(
    "Chave antiga (clockifyApiKey):",
    legacyKey || "❌ Não encontrada (migrada!)",
  );
  console.log(
    "Chave nova (clockifySecretKey):",
    newKey ? "✅ Encontrada" : "❌ Não encontrada",
  );

  if (newKey) {
    console.log("\n📊 Detalhes da chave criptografada:");
    console.log("  - Tamanho:", newKey.length, "caracteres");
    console.log(
      "  - Formato válido:",
      /^[A-Za-z0-9+/]+=*$/.test(newKey) ? "✅ Base64" : "❌ Inválido",
    );
    console.log("  - Primeiros 50 chars:", newKey.substring(0, 50) + "...");
  }

  if (!legacyKey && newKey) {
    console.log("\n✅ Migração completada com sucesso!");
  } else if (legacyKey && !newKey) {
    console.log("\n⚠️  Migração ainda não executada. Recarregue a página.");
  } else if (!legacyKey && !newKey) {
    console.log("\n⚠️  Nenhuma chave encontrada. Configure uma nova API key.");
  }
}

// Cenário 3: Resetar tudo
function resetKeys() {
  console.log("🗑️  Removendo todas as chaves...\n");

  localStorage.removeItem("clockifyApiKey");
  localStorage.removeItem("clockifySecretKey");

  console.log("✅ Todas as chaves removidas");
  console.log("Recarregue a página e configure uma nova API key.");
}

// Exporta funções para uso no console
console.log("🔧 Scripts de teste de migração carregados!\n");
console.log("Comandos disponíveis:");
console.log("  - testLegacyUser()       // Simula usuário com chave antiga");
console.log("  - checkMigrationStatus() // Verifica status da migração");
console.log("  - resetKeys()            // Remove todas as chaves\n");

// Torna disponível globalmente
if (typeof window !== "undefined") {
  window.testLegacyUser = testLegacyUser;
  window.checkMigrationStatus = checkMigrationStatus;
  window.resetKeys = resetKeys;
}
