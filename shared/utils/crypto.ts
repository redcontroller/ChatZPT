// Cryptographic utilities

// Generate random string
export const generateRandomString = (length: number): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Generate random bytes
export const generateRandomBytes = (length: number): Uint8Array => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);
    return array;
  } else {
    // Fallback for Node.js or older browsers
    const array = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  }
};

// Generate UUID v4
export const generateUUID = (): string => {
  const bytes = generateRandomBytes(16);
  
  // Set version (4) and variant bits
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  
  // Convert to hex string
  const hex = Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return [
    hex.substring(0, 8),
    hex.substring(8, 12),
    hex.substring(12, 16),
    hex.substring(16, 20),
    hex.substring(20, 32),
  ].join('-');
};

// Hash string using Web Crypto API
export const hashString = async (text: string, algorithm: string = 'SHA-256'): Promise<string> => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await window.crypto.subtle.digest(algorithm, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } else {
    // Fallback for Node.js or older browsers
    throw new Error('Web Crypto API not available');
  }
};

// Simple hash function (not cryptographically secure)
export const simpleHash = (text: string): string => {
  let hash = 0;
  if (text.length === 0) return hash.toString();
  
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(16);
};

// Base64 encoding/decoding
export const base64Encode = (text: string): string => {
  if (typeof window !== 'undefined' && window.btoa) {
    return window.btoa(text);
  } else {
    // Node.js fallback
    return Buffer.from(text, 'utf8').toString('base64');
  }
};

export const base64Decode = (encoded: string): string => {
  if (typeof window !== 'undefined' && window.atob) {
    return window.atob(encoded);
  } else {
    // Node.js fallback
    return Buffer.from(encoded, 'base64').toString('utf8');
  }
};

// URL-safe base64 encoding/decoding
export const base64UrlEncode = (text: string): string => {
  return base64Encode(text)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

export const base64UrlDecode = (encoded: string): string => {
  // Add padding if needed
  const padded = encoded + '='.repeat((4 - encoded.length % 4) % 4);
  const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
  return base64Decode(base64);
};

// Generate secure random token
export const generateSecureToken = (length: number = 32): string => {
  const bytes = generateRandomBytes(length);
  return base64UrlEncode(Array.from(bytes).map(b => String.fromCharCode(b)).join(''));
};

// Generate password reset token
export const generatePasswordResetToken = (): string => {
  return generateSecureToken(32);
};

// Generate email verification token
export const generateEmailVerificationToken = (): string => {
  return generateSecureToken(32);
};

// Generate API key
export const generateApiKey = (): string => {
  const prefix = 'czpt_';
  const key = generateSecureToken(40);
  return `${prefix}${key}`;
};

// Mask sensitive data
export const maskEmail = (email: string): string => {
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 2) {
    return email;
  }
  
  const maskedLocal = localPart.charAt(0) + '*'.repeat(localPart.length - 2) + localPart.charAt(localPart.length - 1);
  return `${maskedLocal}@${domain}`;
};

export const maskPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 4) {
    return phone;
  }
  
  const visible = cleaned.slice(-4);
  const masked = '*'.repeat(cleaned.length - 4);
  return `${masked}${visible}`;
};

export const maskCreditCard = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\D/g, '');
  if (cleaned.length < 8) {
    return cardNumber;
  }
  
  const firstFour = cleaned.slice(0, 4);
  const lastFour = cleaned.slice(-4);
  const masked = '*'.repeat(cleaned.length - 8);
  return `${firstFour}${masked}${lastFour}`;
};

// Constant-time string comparison (to prevent timing attacks)
export const constantTimeCompare = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
};

// Generate salt for password hashing
export const generateSalt = (): string => {
  return generateSecureToken(16);
};

// Simple XOR encryption (not secure, for basic obfuscation only)
export const xorEncrypt = (text: string, key: string): string => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const textChar = text.charCodeAt(i);
    const keyChar = key.charCodeAt(i % key.length);
    result += String.fromCharCode(textChar ^ keyChar);
  }
  return base64Encode(result);
};

export const xorDecrypt = (encrypted: string, key: string): string => {
  const decoded = base64Decode(encrypted);
  let result = '';
  for (let i = 0; i < decoded.length; i++) {
    const encryptedChar = decoded.charCodeAt(i);
    const keyChar = key.charCodeAt(i % key.length);
    result += String.fromCharCode(encryptedChar ^ keyChar);
  }
  return result;
};
