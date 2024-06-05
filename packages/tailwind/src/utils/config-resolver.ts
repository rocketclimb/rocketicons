import { Config } from "@/types";
import { ResolverOptions } from "./types";

const getNewProperties = <T>(baseConfig: T, customConfig: T): T =>
  Object.entries(customConfig as object)
    .filter(([key]) => !baseConfig[key as keyof typeof baseConfig])
    .reduce((reduced, [key, entry]) => ({ ...reduced, [key]: entry }), {}) as T;

export const configResolver = <T>(
  path: string,
  config: Config,
  options?: ResolverOptions<T>
): T => {
  const merge = (value: T, extend: T) =>
    typeof value === "object" ? deepMerge(value, extend) : extend;

  const parseProperty = (value: T, extend?: T) =>
    extend === undefined ? value : merge(value, extend);

  const deepMerge = (baseConfig: T, customConfig: T): T =>
    Object.entries(baseConfig as object).reduce(
      (reduced, [key, value]) => ({
        ...reduced,
        [key]: parseProperty(
          value,
          customConfig && (customConfig[key as keyof typeof customConfig] as T)
        )
      }),
      getNewProperties(baseConfig, customConfig)
    );

  const cfg = config(options?.rootPath);
  const extendCfg = config("extend");
  const requestedCfg = (cfg && cfg[path]) ?? options?.defaultConfig;
  const extendRequestedCfg =
    extendCfg && ((options?.rootPath && extendCfg[options?.rootPath]) || extendCfg)[path];
  return extendRequestedCfg ? deepMerge(requestedCfg, extendRequestedCfg) : requestedCfg;
};
