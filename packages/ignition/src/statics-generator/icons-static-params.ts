import { CollectionID } from "rocketicons/data";
import { getManifest, write } from "./utils";
import { Languages, AvailableLanguages } from "@/types";
import { serverEnv } from "@/env/server";

const OUTPUT_FILE = "params/icons.json";

const generator = async () => {
  const params = serverEnv.SKIP_BUILD_STATIC_GENERATION
    ? []
    : ([] as { lang: Languages; collectionid: CollectionID }[]).concat(
        ...getManifest().map(({ id }) =>
          AvailableLanguages.map((lang) => ({ lang, collectionid: id }))
        )
      );

  await write(OUTPUT_FILE, JSON.stringify(params));
};

generator();
