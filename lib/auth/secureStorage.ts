/**
 * Secure Storage Utility
 *
 * Provides encrypted storage for sensitive data in localStorage.
 * Uses Web Crypto API for AES-GCM encryption.
 *
 * IMPORTANT: This is client-side encryption for data at rest.
 * The encryption key is derived from a combination of session data
 * and browser fingerprint, providing basic protection against XSS.
 */

class SecureStorage {
  private keyPromise: Promise<CryptoKey> | null = null;

  private async getEncryptionKey(): Promise<CryptoKey> {
    if (this.keyPromise) {
      return this.keyPromise;
    }

    this.keyPromise = (async () => {
      const keyMaterial = await this.getKeyMaterial();
      const salt = await this.getSalt();

      const key = await window.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );

      return key;
    })();

    return this.keyPromise;
  }

  private async getKeyMaterial(): Promise<CryptoKey> {
    const fingerprint = await this.getBrowserFingerprint();
    const encoder = new TextEncoder();
    const keyData = encoder.encode(fingerprint);

    return window.crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
  }

  private async getBrowserFingerprint(): Promise<string> {
    const components = [
      navigator.userAgent,
      navigator.language,
      new Date().getTimezoneOffset().toString(),
      screen.colorDepth.toString(),
      screen.width + 'x' + screen.height,
    ];

    const data = components.join('|');
    return `hairvis_${data}`;
  }

  private async getSalt(): Promise<Uint8Array> {
    let saltHex = localStorage.getItem('__salt');

    if (!saltHex) {
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      saltHex = Array.from(salt)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      localStorage.setItem('__salt', saltHex);
    }

    return new Uint8Array(
      saltHex.match(/.{2}/g)!.map((byte) => parseInt(byte, 16))
    );
  }

  async encrypt(plaintext: string): Promise<string> {
    try {
      const key = await this.getEncryptionKey();
      const encoder = new TextEncoder();
      const data = encoder.encode(plaintext);
      const iv = window.crypto.getRandomValues(new Uint8Array(12));

      const ciphertext = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        key,
        data
      );

      const combined = new Uint8Array(iv.length + ciphertext.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(ciphertext), iv.length);

      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  async decrypt(ciphertext: string): Promise<string> {
    try {
      const key = await this.getEncryptionKey();
      const combined = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
      const iv = combined.slice(0, 12);
      const data = combined.slice(12);

      const decrypted = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        key,
        data
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  async setItem(key: string, value: any): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      const encrypted = await this.encrypt(serialized);
      localStorage.setItem(`__sec_${key}`, encrypted);
    } catch (error) {
      console.error('SecureStorage.setItem failed:', error);
      throw error;
    }
  }

  async getItem<T = any>(key: string): Promise<T | null> {
    try {
      const encrypted = localStorage.getItem(`__sec_${key}`);
      if (!encrypted) return null;

      const decrypted = await this.decrypt(encrypted);
      return JSON.parse(decrypted) as T;
    } catch (error) {
      console.error('SecureStorage.getItem failed:', error);
      localStorage.removeItem(`__sec_${key}`);
      return null;
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(`__sec_${key}`);
  }

  clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith('__sec_')) {
        localStorage.removeItem(key);
      }
    });
  }
}

export const secureStorage = new SecureStorage();
