const KEY_PREFIX = "provider_settings:apiKey:";

// In-memory cache of decrypted keys — populated at startup via loadApiKeysFromStorage()
// and kept in sync by setApiKey/removeApiKey. Synchronous reads are safe after init.
const _decryptedCache = new Map<string, string>();

// In-memory fallback used in Web Worker contexts (no localStorage / no IPC).
// Populated by the worker host via loadApiKeys() before any LLM call is made.
const _memoryStore: Record<string, string> = {};

const KNOWN_PROVIDERS = ["openai", "anthropic", "openrouter"] as const;

// ─── encryption helpers ───────────────────────────────────────────────────────

async function _encrypt(plaintext: string): Promise<string> {
  if (typeof window !== "undefined" && window.electronAPI) {
    return window.electronAPI.encryptString(plaintext);
  }
  return plaintext;
}

async function _decrypt(ciphertext: string): Promise<string> {
  if (typeof window !== "undefined" && window.electronAPI) {
    return window.electronAPI.decryptString(ciphertext);
  }
  return ciphertext;
}

// ─── public API ───────────────────────────────────────────────────────────────

/**
 * Called once at app startup to load and decrypt all stored API keys into the
 * in-memory cache. Must be awaited before any call to getApiKey().
 */
export async function loadApiKeysFromStorage(): Promise<void> {
  for (const provider of KNOWN_PROVIDERS) {
    const stored = localStorage.getItem(KEY_PREFIX + provider);
    if (!stored) continue;
    try {
      const key = await _decrypt(stored);
      _decryptedCache.set(provider, key);
    } catch {
      // Ignore corrupt or unreadable entries.
    }
  }
}

/** Synchronous read — safe after loadApiKeysFromStorage() has resolved. */
export function getApiKey(provider: string): string | null {
  // Workers: read from the in-memory store injected via loadApiKeys().
  if (_memoryStore[provider] !== undefined)
    return _memoryStore[provider] || null;
  // Renderer: read from the decrypted cache.
  return _decryptedCache.get(provider) ?? null;
}

/** Encrypts the key and persists it; updates the in-memory cache immediately. */
export async function setApiKey(provider: string, key: string): Promise<void> {
  const encrypted = await _encrypt(key);
  localStorage.setItem(KEY_PREFIX + provider, encrypted);
  _decryptedCache.set(provider, key);
}

/** Removes the stored key and clears it from all caches. */
export async function removeApiKey(provider: string): Promise<void> {
  localStorage.removeItem(KEY_PREFIX + provider);
  _decryptedCache.delete(provider);
  delete _memoryStore[provider];
}

/** Called by Web Workers to inject keys passed from the main thread. */
export function loadApiKeys(keys: Record<string, string | null>): void {
  for (const [provider, key] of Object.entries(keys)) {
    if (key) _memoryStore[provider] = key;
  }
}
