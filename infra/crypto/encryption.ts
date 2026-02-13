/**
 * Utilitário de criptografia RSA para o frontend
 * Usa a Web Crypto API para criptografar dados com a chave pública
 */

/**
 * Obtém a chave pública das variáveis de ambiente
 */
function getPublicKey(): string {
  const publicKey = process.env.NEXT_PUBLIC_RSA_PUBLIC_KEY;

  if (!publicKey) {
    throw new Error(
      "Chave pública não encontrada. Configure NEXT_PUBLIC_RSA_PUBLIC_KEY no .env ou execute: pnpm generate-keys",
    );
  }

  // Converte \\n literal para quebras de linha reais
  return publicKey.replace(/\\n/g, "\n");
}

/**
 * Converte uma chave PEM para formato CryptoKey
 */
async function importPublicKey(pemKey: string): Promise<CryptoKey> {
  // Remove headers e footers do PEM
  const pemContents = pemKey
    .replace("-----BEGIN PUBLIC KEY-----", "")
    .replace("-----END PUBLIC KEY-----", "")
    .replace(/\s/g, "");

  // Converte base64 para ArrayBuffer
  const binaryDer = atob(pemContents);
  const binaryDerArray = new Uint8Array(binaryDer.length);
  for (let i = 0; i < binaryDer.length; i++) {
    binaryDerArray[i] = binaryDer.charCodeAt(i);
  }

  // Importa a chave
  return await crypto.subtle.importKey(
    "spki",
    binaryDerArray.buffer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    false,
    ["encrypt"],
  );
}

/**
 * Criptografa um texto usando a chave pública
 */
export async function encryptApiKey(apiKey: string): Promise<string> {
  try {
    // Obtém e importa a chave pública
    const publicKeyPem = getPublicKey();
    const cryptoKey = await importPublicKey(publicKeyPem);

    // Converte o texto para ArrayBuffer
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);

    // Criptografa
    const encrypted = await crypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      cryptoKey,
      data,
    );

    // Converte para base64 para armazenamento/transmissão
    const encryptedArray = new Uint8Array(encrypted);
    const encryptedBase64 = btoa(String.fromCharCode(...encryptedArray));

    return encryptedBase64;
  } catch (error) {
    console.error("Erro ao criptografar API key:", error);
    throw new Error("Falha ao criptografar a chave da API");
  }
}

/**
 * Verifica se uma string parece ser uma chave criptografada (base64)
 */
export function isEncrypted(value: string): boolean {
  // Chaves criptografadas com RSA-2048 em base64 têm ~344 caracteres
  // Vamos verificar se tem pelo menos 300 caracteres e é base64 válido
  if (!value || value.length < 300) {
    return false;
  }

  // Verifica se é base64 válido
  const base64Regex = /^[A-Za-z0-9+/]+=*$/;
  return base64Regex.test(value);
}
