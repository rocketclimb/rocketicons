/* eslint-disable @next/next/no-img-element */

import { withLocale } from "@/locales";
import OpenGraph from "@/components/opengraph";
import { PropsWithLangSlugParams } from "@/types";

export const runtime = "edge";
export const alt = "rocketicons - React Icons like you haver seen before!";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const OpengraphImage = async ({
  params: { lang, slug },
}: PropsWithLangSlugParams) => {
  const { doc } = withLocale(lang);

  const { title, description } = doc(slug) as {
    title: string;
    description: string;
  };

  return await OpenGraph({ lang, subheading: title, text: description });
};

export default OpengraphImage;
