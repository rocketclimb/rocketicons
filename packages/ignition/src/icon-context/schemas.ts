import { ICON_CONTEXT_MAX_JSON_BYTES, ICON_CONTEXT_SCHEMA_VERSION } from "./types";

const stringList = (maxItems: number) => ({
  type: "array",
  uniqueItems: true,
  maxItems,
  items: { type: "string", minLength: 1 }
});

const localizedTerms = (maxItems: number) => ({
  type: "object",
  additionalProperties: false,
  required: ["en", "pt-BR"],
  properties: {
    en: stringList(maxItems),
    "pt-BR": stringList(maxItems)
  }
});

const sha256 = { type: "string", pattern: "^[a-f0-9]{64}$" };

export const contextIndexSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "/ai/v1/schemas/icon-context-index.schema.json",
  title: "Rocketicons icon context index",
  type: "object",
  additionalProperties: false,
  required: ["schemaVersion", "kind", "collectionId", "packageVersion", "coverage", "storage"],
  properties: {
    schemaVersion: { const: ICON_CONTEXT_SCHEMA_VERSION },
    kind: { const: "rocketicons.icon-context-index" },
    collectionId: { type: "string", minLength: 1 },
    packageVersion: { type: "string", minLength: 1 },
    promptVersion: { type: ["integer", "null"] },
    coverage: {
      type: "object",
      additionalProperties: false,
      required: ["total", "enriched", "missing", "stale", "orphaned", "complete"],
      properties: {
        total: { type: "integer", minimum: 0 },
        enriched: { type: "integer", minimum: 0 },
        missing: { type: "integer", minimum: 0 },
        stale: { type: "integer", minimum: 0 },
        orphaned: { type: "integer", minimum: 0 },
        complete: { type: "boolean" }
      }
    },
    storage: {
      oneOf: [
        {
          type: "object",
          additionalProperties: false,
          required: ["mode"],
          properties: { mode: { const: "none" } }
        },
        {
          type: "object",
          additionalProperties: false,
          required: ["mode", "url", "bytes", "sha256"],
          properties: {
            mode: { const: "single" },
            url: { type: "string", minLength: 1 },
            bytes: { type: "integer", minimum: 1, maximum: ICON_CONTEXT_MAX_JSON_BYTES },
            sha256
          }
        },
        {
          type: "object",
          additionalProperties: false,
          required: ["mode", "maxBytes", "chunks"],
          properties: {
            mode: { const: "chunked" },
            maxBytes: { const: ICON_CONTEXT_MAX_JSON_BYTES },
            chunks: {
              type: "array",
              minItems: 2,
              items: {
                type: "object",
                additionalProperties: false,
                required: ["id", "url", "count", "bytes", "sha256", "topics"],
                properties: {
                  id: { type: "integer", minimum: 0 },
                  url: { type: "string", minLength: 1 },
                  count: { type: "integer", minimum: 1 },
                  bytes: {
                    type: "integer",
                    minimum: 1,
                    maximum: ICON_CONTEXT_MAX_JSON_BYTES
                  },
                  sha256,
                  topics: stringList(100)
                }
              }
            }
          }
        }
      ]
    }
  }
};

export const contextDataSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "/ai/v1/schemas/icon-context-data.schema.json",
  title: "Rocketicons icon context data",
  type: "object",
  additionalProperties: false,
  required: ["schemaVersion", "kind", "collectionId", "chunk", "icons"],
  properties: {
    schemaVersion: { const: ICON_CONTEXT_SCHEMA_VERSION },
    kind: { const: "rocketicons.icon-context-data" },
    collectionId: { type: "string", minLength: 1 },
    chunk: { type: "integer", minimum: 0 },
    icons: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "id",
          "familyId",
          "sourceHash",
          "description",
          "aliases",
          "searchTerms",
          "negativeTerms",
          "primaryCategory",
          "categories",
          "uiContexts",
          "roles",
          "variant",
          "visual"
        ],
        properties: {
          id: { type: "string", minLength: 1 },
          familyId: { type: "string", minLength: 1 },
          sourceHash: sha256,
          description: {
            type: "object",
            additionalProperties: false,
            required: ["en", "pt-BR"],
            properties: {
              en: { type: "string", minLength: 1, maxLength: 160 },
              "pt-BR": { type: "string", minLength: 1, maxLength: 160 }
            }
          },
          aliases: localizedTerms(12),
          searchTerms: localizedTerms(24),
          negativeTerms: localizedTerms(8),
          primaryCategory: { type: "string", minLength: 1 },
          categories: stringList(6),
          uiContexts: stringList(12),
          roles: stringList(4),
          variant: { type: "string", minLength: 1 },
          visual: {
            type: "object",
            additionalProperties: false,
            required: [
              "filled",
              "outlined",
              "directional",
              "brand",
              "multicolor",
              "strokeSupport"
            ],
            properties: {
              filled: { type: "boolean" },
              outlined: { type: "boolean" },
              directional: { type: "boolean" },
              brand: { type: "boolean" },
              multicolor: { type: "boolean" },
              strokeSupport: { type: "boolean" }
            }
          }
        }
      }
    }
  }
};

export const capabilitiesSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "/ai/v1/schemas/capabilities.schema.json",
  title: "Rocketicons AI catalog capabilities",
  type: "object",
  additionalProperties: false,
  required: ["schemaVersion", "packageVersion", "resources"],
  properties: {
    schemaVersion: { const: 1 },
    packageVersion: { type: "string", minLength: 1 },
    resources: {
      type: "object",
      additionalProperties: false,
      required: ["catalog", "iconContext"],
      properties: {
        catalog: { type: "string", minLength: 1 },
        iconContext: {
          type: "object",
          additionalProperties: false,
          required: ["availability", "languages", "maxJsonBytes", "indexSchema", "dataSchema"],
          properties: {
            availability: { enum: ["partial", "complete"] },
            languages: {
              type: "array",
              uniqueItems: true,
              minItems: 2,
              items: { enum: ["en", "pt-BR"] }
            },
            maxJsonBytes: { const: ICON_CONTEXT_MAX_JSON_BYTES },
            indexSchema: { type: "string", minLength: 1 },
            dataSchema: { type: "string", minLength: 1 }
          }
        }
      }
    }
  }
};
