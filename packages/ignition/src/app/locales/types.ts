import jsonConfig from "./en.json";

export type Config = typeof jsonConfig;
export type Configs = keyof Config;
export type SelectedConfig<T extends Configs> = { [I in T]: Config[I] };
