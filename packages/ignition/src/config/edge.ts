import { get } from "@vercel/edge-config";

export const getConfig = async (key: string) => {
  return await get(key);
};
