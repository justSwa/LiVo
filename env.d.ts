/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_APPCHECK_SITE_KEY?: string;
  readonly VITE_FIREBASE_APPCHECK_DEV?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
