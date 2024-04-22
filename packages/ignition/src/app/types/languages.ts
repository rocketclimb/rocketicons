export const AvailableLanguages = ["en", "pt-br"] as const;
export type Languages = (typeof AvailableLanguages)[number];
