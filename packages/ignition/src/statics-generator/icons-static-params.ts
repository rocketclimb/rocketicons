import { CollectionID } from "rocketicons/data";
import { getManifest, write } from "./utils";
import { Languages, AvailableLanguages } from "@/types";

const OUTPUT_FILE = "params/icons.json";

const generator = async () => {
  const params = ([] as { lang: Languages; collection: CollectionID[] }[]).concat(
    ...getManifest().map(({ id }) =>
      AvailableLanguages.map((lang) => ({ lang, collection: [id] }))
    )
  );

  await write(OUTPUT_FILE, JSON.stringify(params));
};

generator();
