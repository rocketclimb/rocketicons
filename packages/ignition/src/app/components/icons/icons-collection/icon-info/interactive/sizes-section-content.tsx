"use client";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { CollectionID } from "rocketicons/data";
import { Tab, CodeElementOptionsStyler, CodeElementTabs } from "@rocketclimb/code-block";
import { PropsWithChildrenAndLang } from "@/types";
import { withLocale } from "@/locales";

import Section from "./section";
import { useBoxContext } from "./box";

type SizesSectionContentProps = {
  collectionId: CollectionID;
  compName: string;
  sizes: string[];
} & PropsWithChildrenAndLang;

const SizesSectionContent = ({
  lang,
  children,
  collectionId,
  compName,
  sizes
}: SizesSectionContentProps) => {
  const router = useRouter();
  const { size: selectedSize, setSize, sizeBox, sections } = useBoxContext();
  const { copy, copied, more } = withLocale(lang).config("code-block");
  const ref = useRef<HTMLDivElement>(null);
  sections.set("sizes", ref);
  return (
    <Section ref={ref}>
      {children}
      <CodeElementOptionsStyler
        onTabChange={(_i, tab) => {
          if ((tab as Tab)?.id === CodeElementTabs.MORE) {
            router.push(`/docs/sizing-icons?i=${collectionId}.${compName}`);
            return;
          }
          sizeBox
            .get(tab as string)
            ?.current?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
          setSize(tab === CodeElementTabs.DEFAULT ? "" : (tab as string));
        }}
        showMore
        showMoreLabel={more}
        copy={copy}
        copied={copied}
        options={sizes}
        selectedTab={selectedSize}
        component={compName}
      />
    </Section>
  );
};

export default SizesSectionContent;
