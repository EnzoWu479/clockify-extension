/**
 * Utilitário de descriptografia RSA para o backend
 * Usa o módulo crypto do Node.js para descriptografar dados com a chave privada
 */

import { privateDecrypt, constants } from "crypto";

let privateKey: string | null = null;

/**
 * Carrega a chave privada das variáveis de ambiente
 */
function getPrivateKey(): string {
  if (!privateKey) {
    const envKey = process.env.RSA_PRIVATE_KEY;

    if (!envKey) {
      throw new Error(
        "Chave privada não encontrada. Configure RSA_PRIVATE_KEY no .env ou execute: pnpm generate-keys",
      );
    }

    // Converte \\n literal para quebras de linha reais
    privateKey = envKey.replace(/\\n/g, "\n");
  }
  return privateKey;
}

/**
 * Descriptografa um texto criptografado com a chave pública
 */
export function decryptApiKey(encryptedBase64: string): string {
  try {
    const privateKeyPem = getPrivateKey();

    // Converte de base64 para Buffer
    const encryptedBuffer = Buffer.from(encryptedBase64, "base64");

    // Descriptografa
    const decrypted = privateDecrypt(
      {
        key: privateKeyPem,
        padding: constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      encryptedBuffer,
    );

    return decrypted.toString("utf8");
  } catch (error) {
    console.error("Erro ao descriptografar API key:", error);
    throw new Error("Falha ao descriptografar a chave da API");
  }
}

/**
 * Verifica se uma string parece ser uma chave criptografada (base64)
 */
export function isEncrypted(value: string): boolean {
  // Chaves criptografadas com RSA-2048 em base64 têm ~344 caracteres
  if (!value || value.length < 300) {
    return false;
  }

  // Verifica se é base64 válido
  const base64Regex = /^[A-Za-z0-9+/]+=*$/;
  return base64Regex.test(value);
}
