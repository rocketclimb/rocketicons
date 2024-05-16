import { getEdgeConfig } from "./edge";

export * from "./site";

export const getConfig = getEdgeConfig;

export const config = {
  getPlaygroundUrl: async () => getConfig("playgroundUrl")
};
