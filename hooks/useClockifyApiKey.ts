"use client";

import { useEffect, useState } from "react";
import { encryptApiKey } from "@/infra/crypto/encryption";

const LEGACY_STORAGE_KEY = "clockifyApiKey";
const CURRENT_STORAGE_KEY = "clockifySecretKey";

export function useClockifyApiKey() {
  const [apiKey, setApiKey] = useState("");
  const [encryptedApiKey, setEncryptedApiKey] = useState("");
  const [isKeyActive, setIsKeyActive] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    async function loadAndMigrateKey() {
      // Primeiro, tenta carregar a chave nova (criptografada)
      const newKey = window.localStorage.getItem(CURRENT_STORAGE_KEY);

      if (newKey) {
        // Já está na versão nova
        setEncryptedApiKey(newKey);
        setIsKeyActive(true);
        return;
      }

      // Se não tem a nova, verifica se tem a antiga (plain text)
      const legacyKey = window.localStorage.getItem(LEGACY_STORAGE_KEY);

      if (legacyKey) {
        // Migração automática necessária
        setIsMigrating(true);

        try {
          // Criptografa a chave antiga
          const encrypted = await encryptApiKey(legacyKey);

          // Salva na nova chave
          window.localStorage.setItem(CURRENT_STORAGE_KEY, encrypted);

          // Remove a chave antiga
          window.localStorage.removeItem(LEGACY_STORAGE_KEY);

          // Atualiza o estado
          setEncryptedApiKey(encrypted);
          setIsKeyActive(true);

          console.log(
            "✅ API Key migrada com sucesso para versão criptografada",
          );
        } catch (error) {
          console.error("❌ Erro ao migrar API key:", error);
          // Em caso de erro, mantém a chave antiga para não perder dados
        } finally {
          setIsMigrating(false);
        }
      }
    }

    void loadAndMigrateKey();
  }, []);

  const hasKey = isKeyActive && encryptedApiKey.length > 0;

  async function activateKey() {
    const trimmed = apiKey.trim();
    if (!trimmed) return;

    try {
      // Criptografa a chave antes de salvar
      const encrypted = await encryptApiKey(trimmed);

      setEncryptedApiKey(encrypted);
      setIsKeyActive(true);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(CURRENT_STORAGE_KEY, encrypted);
        // Remove a chave antiga se ainda existir
        window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      }

      // Limpa a chave plain text da memória por segurança
      setApiKey("");
    } catch (error) {
      console.error("Erro ao criptografar chave:", error);
      throw error;
    }
  }

  function clearKey() {
    setApiKey("");
    setEncryptedApiKey("");
    setIsKeyActive(false);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(CURRENT_STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  }

  return {
    apiKey,
    setApiKey,
    encryptedApiKey,
    isKeyActive,
    hasKey,
    isMigrating,
    activateKey,
    clearKey,
  };
}
