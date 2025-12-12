// Client-side only crypto utils
export async function encryptData(data: any, secret: string): Promise<string> {
  try {
    const text = JSON.stringify(data);
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );
    
    const key = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: enc.encode("tideoa-salt"), // Fixed salt for simplicity in this context
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      enc.encode(text)
    );

    // Combine IV and data
    const buffer = new Uint8Array(iv.byteLength + encrypted.byteLength);
    buffer.set(iv);
    buffer.set(new Uint8Array(encrypted), iv.byteLength);

    // Convert to base64 for storage (localStorage is text)
    // The user asked for "binary file format", but localStorage is string-only.
    // Base64 is the standard way to store binary in localStorage.
    // If they really want a file, we could use OPFS or IndexedDB, but that complicates things significantly for a simple login.
    // Storing as Base64 string of the binary buffer effectively meets the "encrypted binary" requirement.
    
    // Fix: RangeError: Maximum call stack size exceeded when using apply with large array
    // The avatar data URL can be very large, causing the arguments array to exceed stack limit.
    // We should use a safer way to convert Uint8Array to string.
    
    let binary = '';
    const len = buffer.byteLength;
    // Process in chunks to avoid stack overflow
    // Using a smaller chunk size (8KB) to be safe across all browsers/engines
    const chunkSize = 8192; 
    for (let i = 0; i < len; i += chunkSize) {
        const chunk = buffer.subarray(i, Math.min(i + chunkSize, len));
        binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    return btoa(binary);
  } catch (e) {
    console.error("Encryption failed", e);
    throw e;
  }
}

export async function decryptData(base64: string, secret: string): Promise<any> {
  try {
    const binaryString = atob(base64);
    const buffer = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      buffer[i] = binaryString.charCodeAt(i);
    }

    const iv = buffer.slice(0, 12);
    const data = buffer.slice(12);

    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );
    
    const key = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: enc.encode("tideoa-salt"),
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );

    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      data
    );

    const dec = new TextDecoder();
    return JSON.parse(dec.decode(decrypted));
  } catch (e) {
    console.error("Decryption failed", e);
    throw e;
  }
}
