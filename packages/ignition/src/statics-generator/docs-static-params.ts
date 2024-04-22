import path from "node:path";
import { listFiles, getContents, write } from "./utils";

const OUTPUT_FILE = "params/docs.json";
const LOCALES_FOLDER = "locales/docs/";
const LOCALES_EXT = ".mdx";

const generator = async () => {
  const params = listFiles(LOCALES_FOLDER)
    .filter(
      (filename) =>
        !filename.includes("components") &&
        path.extname(filename.toString()) === LOCALES_EXT
    )
    .map((file) => {
      const slug = (
        /\nslug:(?<slug>.*)\n/g.exec(getContents(`${LOCALES_FOLDER}${file}`))
          ?.groups?.slug || ""
      ).trim();
      const lang = file.toString().replace(LOCALES_EXT, "").split(".").pop();
      return { lang, slug };
    });

  await write(OUTPUT_FILE, JSON.stringify(params));
};

generator();
