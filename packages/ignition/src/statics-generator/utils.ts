import fs from "node:fs";
import path from "node:path";

const DATA_DIR = "./src/app/data-helpers/";

export const templateBuilder = (template: string, ...params: string[]) =>
  params.reduce(
    (parsed, param, i) => parsed.replace(RegExp(`\\{${i}\\}`, "g"), param),
    template
  );

export const write = async (
  filename: string,
  content: string
): Promise<void> => {
  filename = `${DATA_DIR}${filename}`;
  await fs.mkdirSync(path.dirname(filename), { recursive: true });
  await fs.writeFileSync(filename, content);
};
