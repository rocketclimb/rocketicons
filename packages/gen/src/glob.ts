import rawGlob from "glob-promise";
export const glob = (pattern: string): Promise<string[]> =>
  rawGlob(pattern.replace(/\\/g, "/")); // convert windows path
