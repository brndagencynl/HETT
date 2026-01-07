/**
 * Global type declarations for third-party scripts
 */

interface TawkAPI {
  onLoad?: () => void;
  onStatusChange?: (status: string) => void;
  onChatStarted?: () => void;
  onChatEnded?: () => void;
  visitor?: {
    name?: string;
    email?: string;
    hash?: string;
  };
  showWidget?: () => void;
  hideWidget?: () => void;
  toggle?: () => void;
  popup?: () => void;
  maximize?: () => void;
  minimize?: () => void;
  setAttributes?: (attributes: Record<string, string>, callback?: (error?: Error) => void) => void;
  addEvent?: (eventName: string, metadata?: Record<string, unknown>, callback?: (error?: Error) => void) => void;
  addTags?: (tags: string[], callback?: (error?: Error) => void) => void;
  removeTags?: (tags: string[], callback?: (error?: Error) => void) => void;
}

declare global {
  interface Window {
    Tawk_API?: TawkAPI;
    Tawk_LoadStart?: Date;
  }
}

export {};
