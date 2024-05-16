export type ChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export type SitemapRow = {
  url: string;
  lastModified?: Date;
  changeFrequency?: ChangeFrequency;
  priority?: number;
  alternateRefs: Array<{ href: string; hreflang: string }>;
};

export type SitemapIndexRow = {
  url: string;
  lastModified?: Date;
};
