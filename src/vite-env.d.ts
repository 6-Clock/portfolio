/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Contact email injected at build time from .env (VITE_EMAIL). */
  readonly VITE_EMAIL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
