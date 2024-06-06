import { CollectionID } from "rocketicons/data";
import { getManifest, write } from "./utils";
import { serverEnv } from "@/env/server";

const OUTPUT_FILE = "params/collections.json";

const generator = async () => {
  const params = serverEnv.SKIP_BUILD_STATIC_GENERATION
    ? []
    : ([] as { collectionid: CollectionID }[]).concat(
        ...getManifest().map(({ id }) => ({ collectionid: id }))
      );

  await write(OUTPUT_FILE, JSON.stringify(params));
};

generator();
