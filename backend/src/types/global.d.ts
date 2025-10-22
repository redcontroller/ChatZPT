// Global type declarations for backend environment

declare global {
  // Make window optional for Node.js environment
  const window: Window & typeof globalThis | undefined;
  
  // Node.js crypto module fallback
  namespace NodeJS {
    interface Global {
      crypto?: {
        getRandomValues: (array: Uint8Array) => Uint8Array;
        subtle?: {
          digest: (algorithm: string, data: ArrayBuffer) => Promise<ArrayBuffer>;
        };
      };
    }
  }
}

export {};
