import { get } from "@vercel/edge-config";

export const getEdgeConfig = async (key: string) => {
  return await get(key);
};
