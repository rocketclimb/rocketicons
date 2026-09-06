export const ICON_CONTEXT_SCHEMA_VERSION = 1 as const;
export const ICON_CONTEXT_PROMPT_VERSION = 2 as const;
export const ICON_CONTEXT_MAX_JSON_BYTES = 64 * 1024;

export type LocalizedTerms = {
  en: string[];
  "pt-BR": string[];
};

export type LocalizedDescription = {
  en: string;
  "pt-BR": string;
};

export type IconContextFamily = {
  familyId: string;
  icons: Array<{ id: string; sourceHash: string }>;
  description: LocalizedDescription;
  aliases: LocalizedTerms;
  searchTerms: LocalizedTerms;
  negativeTerms: LocalizedTerms;
  primaryCategory: string;
  categories: string[];
  uiContexts: string[];
  roles: string[];
};

export type IconContextSource = {
  schemaVersion: typeof ICON_CONTEXT_SCHEMA_VERSION;
  collectionId: string;
  promptVersion: typeof ICON_CONTEXT_PROMPT_VERSION;
  generatedAt: string;
  generator: "codex-agent";
  families: IconContextFamily[];
};

export type IconContextSourceIndex = {
  schemaVersion: typeof ICON_CONTEXT_SCHEMA_VERSION;
  collectionId: string;
  promptVersion: typeof ICON_CONTEXT_PROMPT_VERSION;
  chunks: string[];
};

export type PublicIconContext = Omit<IconContextFamily, "icons"> & {
  id: string;
  sourceHash: string;
  variant: string;
  visual: {
    filled: boolean;
    outlined: boolean;
    directional: boolean;
    brand: boolean;
    multicolor: boolean;
    strokeSupport: boolean;
  };
};

export type ContextCoverage = {
  total: number;
  enriched: number;
  missing: number;
  stale: number;
  orphaned: number;
  complete: boolean;
};

export type ContextChunkDescriptor = {
  id: number;
  url: string;
  count: number;
  bytes: number;
  sha256: string;
  topics: string[];
};

export type ContextIndexEnvelope = {
  schemaVersion: typeof ICON_CONTEXT_SCHEMA_VERSION;
  kind: "rocketicons.icon-context-index";
  collectionId: string;
  packageVersion: string;
  promptVersion: number | null;
  coverage: ContextCoverage;
  storage:
    | { mode: "none" }
    | { mode: "single"; url: string; bytes: number; sha256: string }
    | {
        mode: "chunked";
        maxBytes: typeof ICON_CONTEXT_MAX_JSON_BYTES;
        chunks: ContextChunkDescriptor[];
      };
};

export type ContextDataEnvelope = {
  schemaVersion: typeof ICON_CONTEXT_SCHEMA_VERSION;
  kind: "rocketicons.icon-context-data";
  collectionId: string;
  chunk: number;
  icons: PublicIconContext[];
};

export type ContextSourceIcon = {
  id: string;
  name: string;
  component: string;
  variant: string;
  iconTree: unknown;
};
