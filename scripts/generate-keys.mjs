import { generateKeyPairSync } from "crypto";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Gera o par de chaves RSA
const { publicKey, privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
  },
});

// Lê o arquivo .env atual se existir
const envPath = join(__dirname, "..", ".env");
let envContent = "";
if (existsSync(envPath)) {
  envContent = readFileSync(envPath, "utf8");
}

// Remove chaves antigas se existirem
const lines = envContent.split("\n").filter((line) => {
  return (
    !line.startsWith("NEXT_PUBLIC_RSA_PUBLIC_KEY=") &&
    !line.startsWith("RSA_PRIVATE_KEY=")
  );
});

// Adiciona as novas chaves (convertendo quebras de linha para \n literal)
const publicKeyEncoded = publicKey.replace(/\n/g, "\\n");
const privateKeyEncoded = privateKey.replace(/\n/g, "\\n");

lines.push("");
lines.push("# RSA Keys for API Key Encryption");
lines.push(`NEXT_PUBLIC_RSA_PUBLIC_KEY="${publicKeyEncoded}"`);
lines.push(`RSA_PRIVATE_KEY="${privateKeyEncoded}"`);

// Salva o .env atualizado
writeFileSync(envPath, lines.join("\n"));

console.log("✅ Chaves RSA geradas com sucesso!");
console.log("📁 Chaves salvas em: .env");
console.log("   - NEXT_PUBLIC_RSA_PUBLIC_KEY (frontend)");
console.log("   - RSA_PRIVATE_KEY (backend only)");
console.log("\n⚠️  IMPORTANTE: O arquivo .env já está no .gitignore");
console.log(
  "💡 Em produção, configure as variáveis NEXT_PUBLIC_RSA_PUBLIC_KEY e RSA_PRIVATE_KEY",
);
