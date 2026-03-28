import * as Crypto from 'expo-crypto';

/** SHA-256 hex digest (same format as web `crypto.subtle`). */
export async function hashPassword(password: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password);
}
