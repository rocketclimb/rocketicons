import { Suspense } from "react";
import type { CollectionID } from "rocketicons/data";

import { MdxPartial } from "@/components/mdx";
import type { PropsWithLang } from "@/types";

import IconInfoLoader from "./loader";

type IconInfoProviderProps = PropsWithLang & { collectionId: CollectionID };

const IconInfoProvider = ({ lang, collectionId }: IconInfoProviderProps) => (
  <Suspense>
    <IconInfoLoader
      lang={lang}
      collectionId={collectionId}
      content={{
        import: <MdxPartial path="components" lang={lang} slug="icon-info-import" />,
        usage: <MdxPartial path="components" lang={lang} slug="icon-info-usage" />,
        sizing: <MdxPartial path="components" lang={lang} slug="icon-info-sizing" />,
        colors: <MdxPartial path="components" lang={lang} slug="icon-info-colors" />,
        stroke: <MdxPartial path="components" lang={lang} slug="icon-info-stroke" />,
        combining: <MdxPartial path="components" lang={lang} slug="icon-info-combining" />,
        dark: <MdxPartial path="components" lang={lang} slug="icon-info-dark" />,
        states: <MdxPartial path="components" lang={lang} slug="icon-info-states" />,
        animations: <MdxPartial path="components" lang={lang} slug="icon-info-animations" />,
        styling: <MdxPartial path="components" lang={lang} slug="icon-info-styling" />
      }}
    />
  </Suspense>
);

export default IconInfoProvider;
