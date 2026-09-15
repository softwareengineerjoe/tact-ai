/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend origin baked in at build time; empty in local dev (Vite proxy). */
  readonly VITE_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
