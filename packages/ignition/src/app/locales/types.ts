import { Languages } from "@/types";
import jsonConfig from "./en.json";

export type Config = typeof jsonConfig;
export type Configs = keyof Config;
export type SelectedConfig<T extends Configs> = { [I in T]: Config[I] };

export type Component = {
  content: string;
  title: string;
  description: string;
  slug: string;
  order: number;
  group: string;
  enslug: string;
  filePath: string;
};

export type Components = Record<string, Component>;

export type MainComponent = Component & {
  components: Components;
};

export type Doc = {
  [Lang in Languages]: MainComponent;
};

export type Docs = Record<string, Doc>;

export type Slug = keyof Docs;

export type DocsAsList = [string, Doc];
export type ComponentsAsList = Component[] | DocsAsList[];
