import { useLocale } from "@/app/locales";
import { write } from "./utils";
import { AvailableLanguages as langs } from "@/types";

const OUTPUT_FILE = "params/docs.json";

type Params = { lang: string; slug: string }[];

const generator = async () => {
  const { docs: getDocs } = useLocale("en");

  const docs = getDocs();

  const enslugs = Object.keys(docs);

  const params = ([] as Params).concat(
    ...enslugs.map((enslug) =>
      langs.map((lang) => ({ lang, slug: docs[enslug][lang]["slug"] }))
    )
  );

  await write(OUTPUT_FILE, JSON.stringify(params));
};

generator();
